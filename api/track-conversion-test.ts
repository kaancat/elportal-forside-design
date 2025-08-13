import { VercelRequest, VercelResponse } from '@vercel/node';

// Interface matching the regular conversion endpoint
interface ConversionData {
  click_id: string;
  conversion_time?: string;
  customer_id?: string;
  product_selected?: string;
  contract_value?: number;
  contract_length_months?: number;
}

interface ValidationResult {
  click_id: 'valid' | 'invalid' | 'missing';
  timestamp: 'valid' | 'invalid' | 'missing';
  authentication: 'valid' | 'invalid';
  format?: 'valid' | 'invalid';
  required_fields?: 'valid' | 'incomplete';
}

/**
 * Verify webhook authentication (same as production)
 */
function verifyWebhookAuth(req: VercelRequest): boolean {
  const secret = req.headers['x-webhook-secret'] as string;
  
  // Use same authentication as production endpoint
  const expectedSecret = process.env.CONVERSION_WEBHOOK_SECRET || 'dev-secret';
  
  return secret === expectedSecret;
}

/**
 * Validate click_id format
 */
function validateClickIdFormat(clickId: string): { valid: boolean; reason?: string } {
  if (!clickId) {
    return { valid: false, reason: 'Missing click_id' };
  }
  
  if (typeof clickId !== 'string') {
    return { valid: false, reason: 'click_id must be string' };
  }
  
  if (!clickId.startsWith('dep_')) {
    return { valid: false, reason: 'click_id must start with "dep_"' };
  }
  
  if (clickId.length < 10) {
    return { valid: false, reason: 'click_id too short' };
  }
  
  return { valid: true };
}

/**
 * Validate timestamp format
 */
function validateTimestamp(timestamp?: string): { valid: boolean; reason?: string } {
  if (!timestamp) {
    return { valid: false, reason: 'Missing conversion_time' };
  }
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return { valid: false, reason: 'Invalid timestamp format' };
    }
    
    // Check if timestamp is reasonable (not too far in past/future)
    const now = Date.now();
    const timestampMs = date.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    
    if (timestampMs > now + dayMs) {
      return { valid: false, reason: 'Timestamp too far in future' };
    }
    
    if (timestampMs < now - (90 * dayMs)) {
      return { valid: false, reason: 'Timestamp too far in past' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, reason: 'Timestamp parsing error' };
  }
}

/**
 * Validate required fields
 */
function validateRequiredFields(data: ConversionData): { valid: boolean; missing?: string[] } {
  const missing: string[] = [];
  
  if (!data.click_id) missing.push('click_id');
  if (!data.customer_id) missing.push('customer_id');
  if (!data.product_selected) missing.push('product_selected');
  
  return {
    valid: missing.length === 0,
    missing: missing.length > 0 ? missing : undefined
  };
}

/**
 * Generate detailed validation report
 */
function generateValidationReport(
  data: ConversionData, 
  authValid: boolean
): { validation: ValidationResult; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate authentication
  const authentication: 'valid' | 'invalid' = authValid ? 'valid' : 'invalid';
  if (!authValid) {
    errors.push('Invalid or missing X-Webhook-Secret header');
  }
  
  // Validate click_id
  const clickIdValidation = validateClickIdFormat(data.click_id);
  const click_id: 'valid' | 'invalid' | 'missing' = data.click_id 
    ? (clickIdValidation.valid ? 'valid' : 'invalid')
    : 'missing';
  
  if (!clickIdValidation.valid) {
    errors.push(`Click ID validation failed: ${clickIdValidation.reason}`);
  }
  
  // Validate timestamp
  const timestampValidation = validateTimestamp(data.conversion_time);
  const timestamp: 'valid' | 'invalid' | 'missing' = data.conversion_time
    ? (timestampValidation.valid ? 'valid' : 'invalid')
    : 'missing';
  
  if (!timestampValidation.valid) {
    if (!data.conversion_time) {
      warnings.push('conversion_time not provided - will use current time');
    } else {
      errors.push(`Timestamp validation failed: ${timestampValidation.reason}`);
    }
  }
  
  // Validate required fields
  const requiredFieldsValidation = validateRequiredFields(data);
  const required_fields: 'valid' | 'incomplete' = requiredFieldsValidation.valid ? 'valid' : 'incomplete';
  
  if (!requiredFieldsValidation.valid) {
    errors.push(`Missing required fields: ${requiredFieldsValidation.missing?.join(', ')}`);
  }
  
  // Check optional fields for warnings
  if (data.contract_value && (typeof data.contract_value !== 'number' || data.contract_value <= 0)) {
    warnings.push('contract_value should be a positive number');
  }
  
  if (data.contract_length_months && (typeof data.contract_length_months !== 'number' || data.contract_length_months <= 0)) {
    warnings.push('contract_length_months should be a positive number');
  }
  
  const validation: ValidationResult = {
    click_id,
    timestamp,
    authentication,
    format: (click_id === 'valid' && (timestamp === 'valid' || timestamp === 'missing')) ? 'valid' : 'invalid',
    required_fields
  };
  
  return { validation, errors, warnings };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS for testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Webhook-Secret');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      status: 'error',
      error: 'Method not allowed',
      message: 'Only POST method is supported'
    });
  }
  
  try {
    // Verify authentication
    const authValid = verifyWebhookAuth(req);
    
    // Parse request body
    let data: ConversionData;
    try {
      data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (parseError) {
      return res.status(400).json({
        status: 'error',
        error: 'Invalid JSON payload',
        message: 'Request body must be valid JSON',
        validation: {
          click_id: 'missing',
          timestamp: 'missing',
          authentication: authValid ? 'valid' : 'invalid',
          format: 'invalid'
        }
      });
    }
    
    // Generate detailed validation report
    const { validation, errors, warnings } = generateValidationReport(data, authValid);
    
    // Determine overall status
    const hasErrors = errors.length > 0;
    const status = hasErrors ? 'error' : 'success';
    
    // Create response message
    let message: string;
    if (!hasErrors) {
      message = 'Test conversion received successfully - all validations passed';
      if (warnings.length > 0) {
        message += ' with warnings';
      }
    } else {
      message = `Test conversion validation failed: ${errors[0]}`;
    }
    
    // Build response
    const response: any = {
      status,
      message,
      validation,
      test_mode: true,
      timestamp: new Date().toISOString()
    };
    
    // Add detailed feedback for test endpoint
    if (errors.length > 0) {
      response.errors = errors;
    }
    
    if (warnings.length > 0) {
      response.warnings = warnings;
    }
    
    // Add helpful debugging info for test mode
    response.debug = {
      received_payload: data,
      authentication_header_present: !!req.headers['x-webhook-secret'],
      content_type: req.headers['content-type'],
      payload_size: JSON.stringify(data).length
    };
    
    // Log test requests for debugging
    console.log('Test conversion request:', {
      status,
      validation,
      errors: errors.length,
      warnings: warnings.length,
      click_id: data.click_id,
      auth_valid: authValid
    });
    
    // Return appropriate HTTP status
    const httpStatus = hasErrors ? 400 : 200;
    return res.status(httpStatus).json(response);
    
  } catch (error) {
    console.error('Test conversion endpoint error:', error);
    
    return res.status(500).json({
      status: 'error',
      error: 'Internal server error',
      message: 'Failed to process test conversion',
      validation: {
        click_id: 'missing',
        timestamp: 'missing',
        authentication: 'invalid',
        format: 'invalid'
      },
      test_mode: true,
      timestamp: new Date().toISOString()
    });
  }
}