# Documentación de la API

Bienvenido a la documentación de la API de MyEcommerce.

## Autenticación

La mayoría de las rutas de la API requieren autenticación mediante un token JWT. Para autenticarse, debe incluir el token en el encabezado de autorización de sus solicitudes:

`Authorization: Bearer <token>`

## Categorías

### Obtener todas las categorías

- **URL:** `/api/categories/`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    [
      {
        "id": 1,
        "name": "Electrónicos",
        "description": "Dispositivos y gadgets electrónicos.",
        "createdAt": "2025-11-22T20:00:00.000Z",
        "updatedAt": "2025-11-22T20:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Libros",
        "description": "Libros de diversas categorías.",
        "createdAt": "2025-11-22T20:00:00.000Z",
        "updatedAt": "2025-11-22T20:00:00.000Z"
      }
    ]
    ```

### Obtener una categoría por ID

- **URL:** `/api/categories/:id`
- **Method:** `GET`
- **URL Params:**
  - `id` (integer, required)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "id": 1,
      "name": "Electrónicos",
      "description": "Dispositivos y gadgets electrónicos.",
      "createdAt": "2025-11-22T20:00:00.000Z",
      "updatedAt": "2025-11-22T20:00:00.000Z",
      "Products": [
        {
          "id": 101,
          "name": "Smartphone",
          ...
        }
      ]
    }
    ```

### Crear una nueva categoría (Admin)

- **URL:** `/api/categories/create`
- **Method:** `POST`
- **Auth required:** `Admin`
- **Body:**
  - `name` (string, required)
  - `description` (string, optional)
- **Success Response:**
  - **Code:** 201
  - **Content:**
    ```json
    {
      "id": 3,
      "name": "Ropa",
      "description": "Ropa para todas las edades.",
      "createdAt": "2025-11-22T21:00:00.000Z",
      "updatedAt": "2025-11-22T21:00:00.000Z"
    }
    ```

### Actualizar una categoría (Admin)

- **URL:** `/api/categories/:id`
- **Method:** `PUT`
- **Auth required:** `Admin`
- **URL Params:**
  - `id` (integer, required)
- **Body:**
  - `name` (string, optional)
  - `description` (string, optional)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "id": 3,
      "name": "Ropa y Accesorios",
      "description": "Ropa y accesorios para todas las edades.",
      "createdAt": "2025-11-22T21:00:00.000Z",
      "updatedAt": "2025-11-22T21:05:00.000Z"
    }
    ```

### Eliminar una categoría (Admin)

- **URL:** `/api/categories/:id`
- **Method:** `DELETE`
- **Auth required:** `Admin`
- **URL Params:**
  - `id` (integer, required)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "msg": "Categoría eliminada con éxito"
    }
    ```

## Productos

### Obtener todos los productos

- **URL:** `/api/products/`
- **Method:** `GET`
- **Query Params:**
  - `category` (string, optional) - Filtra los productos por el nombre de la categoría.
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    [
      {
        "id": 101,
        "name": "Smartphone",
        "description": "Un smartphone de última generación.",
        "price": "699.99",
        "stock": 150,
        "imageUrl": "1732299600000-smartphone.jpg",
        "categoryId": 1,
        "createdAt": "2025-11-22T20:00:00.000Z",
        "updatedAt": "2025-11-22T20:00:00.000Z",
        "Category": {
          "name": "Electrónicos"
        }
      }
    ]
    ```

### Obtener un producto por ID

- **URL:** `/api/products/:id`
- **Method:** `GET`
- **URL Params:**
  - `id` (integer, required)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "id": 101,
      "name": "Smartphone",
      "description": "Un smartphone de última generación.",
      "price": "699.99",
      "stock": 150,
      "imageUrl": "1732299600000-smartphone.jpg",
      "categoryId": 1,
      "createdAt": "2025-11-22T20:00:00.000Z",
      "updatedAt": "2025-11-22T20:00:00.000Z",
      "Category": {
        "name": "Electrónicos"
      }
    }
    ```

### Crear un nuevo producto (Admin)

- **URL:** `/api/products/`
- **Method:** `POST`
- **Auth required:** `Admin`
- **Body (multipart/form-data):**
  - `name` (string, required)
  - `description` (string, required)
  - `price` (float, required)
  - `stock` (integer, required)
  - `categoryId` (integer, required)
  - `image` (file, optional) - Archivo de imagen del producto.
- **Success Response:**
  - **Code:** 201
  - **Content:**
    ```json
    {
      "id": 102,
      "name": "Laptop",
      "description": "Una laptop potente para trabajar y jugar.",
      "price": "1299.99",
      "stock": 50,
      "categoryId": 1,
      "imageUrl": "1732300200000-laptop.jpg",
      "createdAt": "2025-11-22T21:10:00.000Z",
      "updatedAt": "2025-11-22T21:10:00.000Z"
    }
    ```

### Actualizar un producto (Admin)

- **URL:** `/api/products/:id`
- **Method:** `PUT`
- **Auth required:** `Admin`
- **URL Params:**
  - `id` (integer, required)
- **Body (multipart/form-data):**
  - `name` (string, optional)
  - `description` (string, optional)
  - `price` (float, optional)
  - `stock` (integer, optional)
  - `categoryId` (integer, optional)
  - `image` (file, optional) - Archivo de imagen del producto.
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "id": 102,
      "name": "Laptop Pro",
      "description": "Una laptop aún más potente para profesionales.",
      "price": "1499.99",
      ...
    }
    ```

### Eliminar un producto (Admin)

- **URL:** `/api/products/:id`
- **Method:** `DELETE`
- **Auth required:** `Admin`
- **URL Params:**
  - `id` (integer, required)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "error": false,
      "message": "Producto eliminado con éxito"
    }
    ```

## Autenticación y Usuarios

### Registro de usuario

- **URL:** `/api/users/register`
- **Method:** `POST`
- **Body:**
  - `firstName` (string, required)
  - `lastName` (string, required)
  - `email` (string, required)
  - `password` (string, required)
  - `repassword` (string, required)
- **Success Response:**
  - **Code:** 201
  - **Content:**
    ```json
    {
      "msg": "Usuario registrado con éxito",
      "user": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        ...
      }
    }
    ```

### Login de usuario

- **URL:** `/api/users/login`
- **Method:** `POST`
- **Body:**
  - `email` (string, required)
  - `password` (string, required)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "token": "...",
      "user": {
        "id": 1,
        "email": "john.doe@example.com",
        ...
      }
    }
    ```

### Olvidé mi contraseña

- **URL:** `/api/users/forgotpassword`
- **Method:** `POST`
- **Body:**
  - `email` (string, required)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "success": true,
      "data": "Correo electrónico enviado"
    }
    ```

### Restablecer contraseña

- **URL:** `/api/users/resetpassword/:token`
- **Method:** `PUT`
- **URL Params:**
  - `token` (string, required)
- **Body:**
  - `password` (string, required)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "msg": "Contraseña restablecida con éxito."
    }
    ```

### Verificar token

- **URL:** `/api/users/verify/:token`
- **Method:** `GET`
- **URL Params:**
  - `token` (string, required)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "error": false,
      "msg": "Token Válido"
    }
    ```

### Obtener perfil de usuario

- **URL:** `/api/users/profile`
- **Method:** `GET`
- **Auth required:** `User`
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      ...
    }
    ```

### Actualizar perfil de usuario

- **URL:** `/api/users/profile`
- **Method:** `PUT`
- **Auth required:** `User`
- **Body:**
  - `firstName` (string, optional)
  - `lastName` (string, optional)
  - `email` (string, optional)
  - `phone` (string, optional)
  - `addressLine1` (string, optional)
  - `addressLine2` (string, optional)
  - `city` (string, optional)
  - `state` (string, optional)
  - `postalCode` (string, optional)
  - `country` (string, optional)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      ...
    }
    ```

### Actualizar contraseña de usuario

- **URL:** `/api/users/profile/password`
- **Method:** `PUT`
- **Auth required:** `User`
- **Body:**
  - `oldPassword` (string, required)
  - `newPassword` (string, required)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "msg": "Contraseña actualizada con éxito."
    }
    ```

### Obtener todos los usuarios (Admin)

- **URL:** `/api/users/`
- **Method:** `GET`
- **Auth required:** `Admin`
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    [
      {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        ...
      }
    ]
    ```

### Actualizar rol de usuario (Admin)

- **URL:** `/api/users/:id/role`
- **Method:** `PUT`
- **Auth required:** `Admin`
- **URL Params:**
  - `id` (integer, required)
- **Body:**
  - `role` (string, required) - "user" or "admin"
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "id": 2,
      "role": "admin",
      ...
    }
    ```

### Eliminar usuario (Admin)

- **URL:** `/api/users/:id`
- **Method:** `DELETE`
- **Auth required:** `Admin`
- **URL Params:**
  - `id` (integer, required)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "msg": "Usuario eliminado con éxito."
    }
    ```

## Carrito

Todas las rutas del carrito requieren autenticación de usuario.

### Obtener el carrito del usuario

- **URL:** `/api/cart/`
- **Method:** `GET`
- **Auth required:** `User`
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "id": 1,
      "userId": 1,
      "createdAt": "2025-11-22T20:00:00.000Z",
      "updatedAt": "2025-11-22T20:00:00.000Z",
      "CartItems": [
        {
          "id": 1,
          "cartId": 1,
          "productId": 101,
          "quantity": 2,
          "Product": {
            "id": 101,
            "name": "Smartphone",
            "price": "699.99",
            ...
          }
        }
      ]
    }
    ```

### Añadir un producto al carrito

- **URL:** `/api/cart/add`
- **Method:** `POST`
- **Auth required:** `User`
- **Body:**
  - `productId` (integer, required)
  - `quantity` (integer, required)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "error": false,
      "msg": "Producto añadido al carrito",
      "cart": { ... }
    }
    ```

### Actualizar la cantidad de un producto en el carrito

- **URL:** `/api/cart/update/:productId`
- **Method:** `PUT`
- **Auth required:** `User`
- **URL Params:**
  - `productId` (integer, required)
- **Body:**
  - `quantity` (integer, required)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "id": 1,
      "cartId": 1,
      "productId": 101,
      "quantity": 3,
      ...
    }
    ```

### Eliminar un producto del carrito

- **URL:** `/api/cart/remove/:productId`
- **Method:** `DELETE`
- **Auth required:** `User`
- **URL Params:**
  - `productId` (integer, required)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "error": false,
      "message": "Producto eliminado del carrito"
    }
    ```

### Vaciar el carrito

- **URL:** `/api/cart/clear`
- **Method:** `DELETE`
- **Auth required:** `User`
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "error": false,
      "message": "Carrito vaciado con éxito"
    }
    ```

## Órdenes

Todas las rutas de órdenes requieren autenticación de usuario.

### Crear una orden

- **URL:** `/api/orders/`
- **Method:** `POST`
- **Auth required:** `User`
- **Success Response:**
  - **Code:** 201
  - **Content:**
    ```json
    {
      "id": 1,
      "userId": 1,
      "total": "1399.98",
      "status": "pending",
      "shippingAddress": "123 Main St",
      "shippingCity": "Anytown",
      "shippingState": "CA",
      "shippingPostalCode": "90210",
      "shippingCountry": "USA",
      "createdAt": "2025-11-22T22:00:00.000Z",
      "updatedAt": "2025-11-22T22:00:00.000Z"
    }
    ```

### Obtener órdenes del usuario

- **URL:** `/api/orders/`
- **Method:** `GET`
- **Auth required:** `User`
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    [
      {
        "id": 1,
        "userId": 1,
        "total": "1399.98",
        "status": "pending",
        "createdAt": "2025-11-22T22:00:00.000Z",
        "updatedAt": "2025-11-22T22:00:00.000Z",
        "OrderItems": [...]
      }
    ]
    ```

### Obtener una orden específica del usuario

- **URL:** `/api/orders/:id`
- **Method:** `GET`
- **Auth required:** `User`
- **URL Params:**
  - `id` (integer, required)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "id": 1,
      "userId": 1,
      "total": "1399.98",
      "status": "pending",
      "createdAt": "2025-11-22T22:00:00.000Z",
      "updatedAt": "2025-11-22T22:00:00.000Z",
      "OrderItems": [...]
    }
    ```

### Obtener todas las órdenes (Admin)

- **URL:** `/api/orders/admin/all`
- **Method:** `GET`
- **Auth required:** `Admin`
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    [
      {
        "id": 1,
        "userId": 1,
        "total": "1399.98",
        "status": "pending",
        "User": {
          "id": 1,
          "firstName": "John",
          "email": "john.doe@example.com"
        },
        "OrderItems": [...]
      }
    ]
    ```

### Actualizar el estado de una orden (Admin)

- **URL:** `/api/orders/admin/:id/status`
- **Method:** `PUT`
- **Auth required:** `Admin`
- **URL Params:**
  - `id` (integer, required)
- **Body:**
  - `status` (string, required) - Ejemplo: "shipped", "delivered", "cancelled"
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "id": 1,
      "userId": 1,
      "total": "1399.98",
      "status": "shipped",
      ...
    }
    ```

## Pagos

Todas las rutas de pagos requieren autenticación de usuario.

### Crear sesión de pago (Stripe Checkout)

- **URL:** `/api/payment/create-checkout-session`
- **Method:** `POST`
- **Auth required:** `User`
- **Body:** (No se requiere un body explícito, la sesión se crea a partir del carrito del usuario autenticado)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "url": "https://checkout.stripe.com/c/pay/..."
    }
    ```

### Verificar sesión de pago

- **URL:** `/api/payment/verify-session`
- **Method:** `POST`
- **Auth required:** `User`
- **Body:**
  - `sessionId` (string, required) - ID de la sesión de pago de Stripe.
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "verified": true,
      "orderId": 123
    }
    ```

## Reportes

Todas las rutas de reportes requieren autenticación de administrador.

### Exportar órdenes

- **URL:** `/api/reports/orders`
- **Method:** `GET`
- **Auth required:** `Admin`
- **Success Response:**
  - **Code:** 200
  - **Content:** Archivo Excel/CSV de órdenes.

### Exportar datos del Dashboard

- **URL:** `/api/reports/dashboard`
- **Method:** `GET`
- **Auth required:** `Admin`
- **Success Response:**
  - **Code:** 200
  - **Content:** Archivo Excel/CSV de datos del dashboard.







