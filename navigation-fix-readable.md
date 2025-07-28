# Navigation Fix Instructions

## Issue
The navigation items in Sanity are missing their `_type` field, causing validation errors.

## Solution
1. Go to [Sanity Studio](https://dinelportal.sanity.studio)
2. Navigate to **Site Settings**
3. In the **Header Navigation** section:

### Delete all existing items and re-add them as follows:

#### 1. Elpriser
- Type: **Link**
- Link Type: **internal**
- Internal Page: **Elpriser 2025 - Find det billigste elselskab**

#### 2. Elselskaber
- Type: **Link**
- Link Type: **internal**
- Internal Page: **Danmarks Store Guide til Elselskaber**

#### 3. Ladeboks
- Type: **Link**
- Link Type: **internal**
- Internal Page: **Ladeboks til Elbil - Find den Bedste Hjemmelader**

#### 4. Bliv klogere på
- Type: **Link**
- Link Type: **external**

#### 5. Sammenlign Priser
- Type: **Link**
- Link Type: **internal**
- Internal Page: **Om os**
- Is Button: **Yes** ✓

#### 6. Bliv klogere
- Type: **Mega Menu**
- Columns:
  - **Elpriser & Prognoser**
    - Aktuelle elpriser
    - Historiske elpriser
    - Elpriser prognose
  - **Guides & Tips**
    - Energibesparende tips
    - Ladeboks til elbil
    - Grøn energi
  - **Om elmarkedet**
    - Sådan fungerer elmarkedet
    - Elselskaber i Danmark
    - Vindstød

