import React from 'react';
import { AlertCircle, RefreshCw, Home, WifiOff, Server, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// API Error Fallback - for failed data fetching
export const ApiErrorFallback: React.FC<{
  onRetry: () => void;
  message?: string;
}> = ({ onRetry, message = "Kunne ikke hente data" }) => {
  return (
    <Card className="m-4 border-blue-200 bg-blue-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <WifiOff className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-blue-900">{message}</h3>
            <p className="text-sm text-blue-700 mt-1">
              Tjek din internetforbindelse og prøv igen.
            </p>
          </div>
          <Button 
            onClick={onRetry} 
            variant="outline" 
            size="sm"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Prøv igen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Chart/Graph Error Fallback - for visualization components
export const ChartErrorFallback: React.FC<{
  onRetry: () => void;
  title?: string;
}> = ({ onRetry, title = "Diagram" }) => {
  return (
    <Card className="m-4 border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-gray-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <Server className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">Data ikke tilgængelig</h3>
          <p className="text-sm text-gray-600 mb-4">
            Vi kunne ikke indlæse diagrammet. Prøv at opdatere siden.
          </p>
          <Button 
            onClick={onRetry} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Genindlæs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Calculator Error Fallback - for calculation components
export const CalculatorErrorFallback: React.FC<{
  onRetry: () => void;
  onReset?: () => void;
}> = ({ onRetry, onReset }) => {
  return (
    <Card className="m-4 border-orange-200 bg-orange-50">
      <CardContent className="pt-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bug className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="font-medium text-orange-900 mb-2">Beregneren virker ikke</h3>
          <p className="text-sm text-orange-700 mb-4">
            Der opstod en fejl i beregningen. Prøv at nulstille eller genindlæse.
          </p>
          <div className="flex gap-2 justify-center">
            {onReset && (
              <Button 
                onClick={onReset} 
                variant="outline" 
                size="sm"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                Nulstil
              </Button>
            )}
            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="sm"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Prøv igen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Content Error Fallback - for CMS content that fails to load
export const ContentErrorFallback: React.FC<{
  onRetry?: () => void;
  message?: string;
}> = ({ onRetry, message = "Indhold kunne ikke indlæses" }) => {
  return (
    <div className="m-4 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-5 h-5 text-gray-500" />
        </div>
        <p className="text-sm text-gray-600 mb-3">{message}</p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-gray-400 mb-3">Debug: See console/network for details</p>
        )}
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="ghost" 
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            Prøv igen
          </Button>
        )}
      </div>
    </div>
  );
};

// Navigation Error Fallback - for menu/navigation failures
export const NavigationErrorFallback: React.FC<{
  onRetry: () => void;
}> = ({ onRetry }) => {
  return (
    <Alert className="m-2 border-red-200 bg-red-50">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">Navigation fejl</AlertTitle>
      <AlertDescription className="mt-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-red-700">Menu kunne ikke indlæses</span>
          <Button 
            onClick={onRetry} 
            variant="ghost" 
            size="sm"
            className="h-auto p-1 text-red-600 hover:text-red-800"
          >
            Prøv igen
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

// Form Error Fallback - for form submission errors
export const FormErrorFallback: React.FC<{
  onRetry: () => void;
  message?: string;
}> = ({ onRetry, message = "Formularen kunne ikke sendes" }) => {
  return (
    <Alert className="m-4 border-red-200 bg-red-50">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">Indsendelse fejlede</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm text-red-700 mb-3">{message}</p>
        <Button 
          onClick={onRetry} 
          variant="outline" 
          size="sm"
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          Prøv at sende igen
        </Button>
      </AlertDescription>
    </Alert>
  );
};

// Generic Error Fallback with custom actions
export const GenericErrorFallback: React.FC<{
  title?: string;
  message?: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  }>;
}> = ({ 
  title = "Der opstod en fejl", 
  message = "Noget gik galt. Prøv igen senere.",
  actions = []
}) => {
  return (
    <Card className="m-4 border-gray-200">
      <CardContent className="pt-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-gray-500" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{message}</p>
          {actions.length > 0 && (
            <div className="flex gap-2 justify-center">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || 'outline'}
                  size="sm"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};