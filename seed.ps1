# Helper function for API requests
function Invoke-ApiRequest {
    param(
        [string]$Uri,
        [string]$Method,
        [object]$Headers,
        [object]$Body
    )
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            ContentType = 'application/json'
        }
        if ($Headers) {
            $params.Headers = $Headers
        }
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 5)
        }
        return Invoke-RestMethod @params
    }
    catch {
        Write-Host "Error making API request to $Uri" -ForegroundColor Red
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd();
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
        return $null
    }
}

# --- 1. Register Admin User ---
Write-Host "Registering admin user..."
$adminUser = @{
    firstName = "Admin"
    lastName = "User"
    email = "admin@example.com"
    password = "password123"
    repassword = "password123"
}
Invoke-ApiRequest -Uri "http://localhost:3000/api/users/register" -Method Post -Body $adminUser

# --- 2. Login as Admin and Get Token ---
Write-Host "Logging in as admin..."
$loginBody = @{
    email = $adminUser.email
    password = $adminUser.password
}
$loginResponse = Invoke-ApiRequest -Uri "http://localhost:3000/api/users/login" -Method Post -Body $loginBody
$adminToken = $loginResponse.token
if (-not $adminToken) {
    Write-Host "Failed to get admin token. Aborting."
    exit
}
$authHeader = @{ Authorization = "Bearer $adminToken" }

# --- 3. Create Categories ---
Write-Host "Creating categories..."
$categories = @("Electrónica", "Ropa", "Libros", "Hogar", "Juguetes")
$createdCategories = foreach ($categoryName in $categories) {
    $categoryBody = @{
        name = $categoryName
        description = "Artículos de $categoryName"
    }
    Invoke-ApiRequest -Uri "http://localhost:3000/api/categories/create" -Method Post -Headers $authHeader -Body $categoryBody
}
Write-Host "$($createdCategories.Length) categories created."

# --- 4. Create Products ---
Write-Host "Creating products..."
for ($i = 1; $i -le 20; $i++) {
    $category = $createdCategories | Get-Random
    $productBody = @{
        name = "Producto $i"
        sku = "SKU-$i"
        description = "Descripción del producto $i."
        price = (Get-Random -Minimum 10 -Maximum 500)
        stock = (Get-Random -Minimum 1 -Maximum 100)
        categoryId = $category.id
    }
    Invoke-ApiRequest -Uri "http://localhost:3000/api/products" -Method Post -Headers $authHeader -Body $productBody
}
Write-Host "20 products created."

# --- 5. Register a customer user ---
Write-Host "Registering customer user..."
$customerUser = @{
    firstName = "Customer"
    lastName = "User"
    email = "customer@example.com"
    password = "password123"
    repassword = "password123"
    phone = "123-456-7890"
    addressLine1 = "123 Main St"
    city = "Anytown"
    state = "CA"
    postalCode = "12345"
    country = "USA"
}
Invoke-ApiRequest -Uri "http://localhost:3000/api/users/register" -Method Post -Body $customerUser

# --- 6. Login as customer and get token ---
Write-Host "Logging in as customer..."
$customerLoginBody = @{
    email = $customerUser.email
    password = $customerUser.password
}
$customerLoginResponse = Invoke-ApiRequest -Uri "http://localhost:3000/api/users/login" -Method Post -Body $customerLoginBody
$customerToken = $customerLoginResponse.token
if (-not $customerToken) {
    Write-Host "Failed to get customer token. Aborting order creation."
    exit
}
$customerAuthHeader = @{ Authorization = "Bearer $customerToken" }

# --- 7. Create Orders for the customer ---
Write-Host "Creating orders for customer..."
$allProducts = Invoke-ApiRequest -Uri "http://localhost:3000/api/products" -Method Get -Headers $customerAuthHeader

for ($i = 1; $i -le 5; $i++) {
    # Add items to cart
    $product1 = $allProducts | Get-Random
    $product2 = $allProducts | Get-Random
    $cartBody1 = @{ productId = $product1.id; quantity = (Get-Random -Minimum 1 -Maximum 3) }
    $cartBody2 = @{ productId = $product2.id; quantity = (Get-Random -Minimum 1 -Maximum 2) }
    Invoke-ApiRequest -Uri "http://localhost:3000/api/cart/add" -Method Post -Headers $customerAuthHeader -Body $cartBody1
    Invoke-ApiRequest -Uri "http://localhost:3000/api/cart/add" -Method Post -Headers $customerAuthHeader -Body $cartBody2

    # Create order from cart
    Invoke-ApiRequest -Uri "http://localhost:3000/api/orders" -Method Post -Headers $customerAuthHeader
}
Write-Host "5 orders created for customer."

# --- 8. Update some order statuses (as admin) ---
Write-Host "Updating order statuses..."
$allOrders = Invoke-ApiRequest -Uri "http://localhost:3000/api/orders/admin/all" -Method Get -Headers $authHeader
$statuses = @("shipped", "delivered", "cancelled")
foreach ($order in ($allOrders | Get-Random -Count 2)) {
    $newStatus = $statuses | Get-Random
    $statusBody = @{ status = $newStatus }
    Invoke-ApiRequest -Uri "http://localhost:3000/api/orders/$($order.id)/status" -Method Put -Headers $authHeader -Body $statusBody
    Write-Host "Order $($order.id) status updated to $newStatus"
}

Write-Host "Seed script finished."
