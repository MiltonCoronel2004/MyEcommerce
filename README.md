# Documentación del Proyecto E-commerce

Este documento proporciona una descripción detallada de la arquitectura, rutas y endpoints de la aplicación E-commerce, tanto para el Frontend como para el Backend.

##  Tabla de Contenidos

- [Visión General del Proyecto](#-visión-general-del-proyecto)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Documentación Frontend](#-documentación-frontend)
  - [Rutas Públicas](#rutas-públicas)
  - [Rutas de Autenticación](#rutas-de-autenticación)
  - [Rutas Privadas de Usuario](#rutas-privadas-de-usuario)
  - [Rutas de Administrador](#rutas-de-administrador)
- [Documentación Backend (API)](#-documentación-backend-api)
  - [Autenticación](#autenticación)
  - [Usuarios (Users)](#usuarios-users)
  - [Categorías (Categories)](#categorías-categories)
  - [Productos (Products)](#productos-products)
  - [Carrito (Cart)](#carrito-cart)
  - [Órdenes (Orders)](#órdenes-orders)
  - [Pagos (Payments)](#pagos-payments)

---

##  Visión General del Proyecto

Esta es una aplicación full-stack de comercio electrónico que incluye un frontend en React para la interacción del usuario y un backend en Node.js/Express para la lógica de negocio y la gestión de la base de datos.

- **Frontend**: Una Single Page Application (SPA) construida con React, utilizando Vite como empaquetador. Gestiona el estado con Zustand y se comunica con el backend a través de una API REST.
- **Backend**: Una API RESTful construida con Node.js y Express. Utiliza Sequelize como ORM para interactuar con una base de datos SQL. La autenticación se maneja con JSON Web Tokens (JWT).

---

##  Tecnologías Utilizadas

- **Frontend**: React, React Router, Zustand, TailwindCSS, Vite.
- **Backend**: Node.js, Express, Sequelize, MySQL, JWT, Multer (para subida de archivos), Stripe (para pagos).

---

##  Documentación Frontend

La aplicación se estructura en layouts y rutas para separar las vistas públicas, las de usuarios autenticados y las de administradores.

### Rutas Públicas

Estas rutas son accesibles para cualquier visitante del sitio.

- **`GET /`**
  - **Página**: `HomePage`
  - **Descripción**: La página de inicio de la tienda. Muestra un listado de productos destacados o todos los productos disponibles. Permite a los usuarios ver los productos y navegar a sus páginas de detalle.

- **`GET /product/:id`**
  - **Página**: `ProductDetailPage`
  - **Descripción**: Muestra la información detallada de un producto específico, incluyendo nombre, descripción, precio, imagen y un botón para "Añadir al carrito".

### Rutas de Autenticación

Rutas para el registro, inicio de sesión y recuperación de contraseña. Solo son accesibles para usuarios no autenticados.

- **`GET /login`**
  - **Página**: `LoginPage`
  - **Descripción**: Formulario para que los usuarios inicien sesión con su email y contraseña.

- **`GET /register`**
  - **Página**: `RegisterPage`
  - **Descripción**: Formulario para que nuevos usuarios se registren en la aplicación proporcionando su nombre, email y contraseña.

- **`GET /forgot-password`**
  - **Página**: `ForgotPasswordPage`
  - **Descripción**: Formulario donde un usuario puede ingresar su email para recibir un enlace y restablecer su contraseña.

- **`GET /reset-password/:token`**
  - **Página**: `ResetPasswordPage`
  - **Descripción**: Página a la que llega el usuario después de hacer clic en el enlace de recuperación. Permite establecer una nueva contraseña.

### Rutas Privadas de Usuario

Estas rutas solo son accesibles para usuarios que han iniciado sesión.

- **`GET /profile`**
  - **Página**: `ProfilePage`
  - **Descripción**: Página de perfil del usuario donde puede ver y actualizar su información personal (nombre, email).

- **`GET /cart`**
  - **Página**: `CartPage`
  - **Descripción**: Muestra el contenido del carrito de compras del usuario. Permite actualizar la cantidad de productos, eliminarlos del carrito y proceder al pago.

- **`GET /orders`**
  - **Página**: `MyOrdersPage`
  - **Descripción**: Muestra un historial de todas las órdenes realizadas por el usuario, incluyendo su estado.

- **`GET /order/success`**
  - **Página**: `PaymentSuccessPage`
  - **Descripción**: Página a la que se redirige al usuario después de un pago exitoso. Muestra una confirmación de la orden.

- **`GET /order/cancel`**
  - **Página**: `PaymentCancelPage`
  - **Descripción**: Página a la que se redirige al usuario si cancela el proceso de pago.

### Rutas de Administrador

Estas rutas solo son accesibles para usuarios con rol de administrador.

- **`GET /dashboard`**
  - **Página**: `DashboardPage`
  - **Descripción**: Panel principal para administradores, que podría mostrar estadísticas de ventas, usuarios, etc.

- **`GET /admin/products`**
  - **Página**: `ProductListPage`
  - **Descripción**: Interfaz para gestionar (crear, ver, editar, eliminar) todos los productos de la tienda.

- **`GET /admin/categories`**
  - **Página**: `CategoryListPage`
  - **Descripción**: Interfaz para gestionar las categorías de los productos.

- **`GET /admin/orders`**
  - **Página**: `OrderListPage`
  - **Descripción**: Interfaz para que los administradores vean todas las órdenes de los usuarios y actualicen su estado (ej: de "Pendiente" a "Enviado").

---

##  Documentación Backend (API)

La API sigue los principios REST y utiliza JSON para el intercambio de datos.

### Autenticación

- La mayoría de las rutas protegidas requieren un **JSON Web Token (JWT)**.
- El token debe ser enviado en la cabecera `Authorization` con el formato `Bearer <token>`.
- Las rutas marcadas con `Requiere Admin` adicionalmente verifican que el usuario tenga el rol de administrador.

---

### Usuarios (Users)

Endpoints para la gestión de usuarios y autenticación.

#### `POST /api/users/register`

Registra un nuevo usuario.

- **Body**: `JSON`
  - `name` (string, requerido): Nombre del usuario.
  - `email` (string, requerido): Email único para el usuario.
  - `password` (string, requerido): Contraseña (mínimo 6 caracteres).
- **Respuesta**: `JSON` - El objeto del usuario creado con un token de autenticación.
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "token": "ey..."
  }
  ```

#### `POST /api/users/login`

Autentica un usuario y devuelve un token.

- **Body**: `JSON`
  - `email` (string, requerido): Email del usuario.
  - `password` (string, requerido): Contraseña del usuario.
- **Respuesta**: `JSON` - El objeto del usuario con un nuevo token.
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "token": "ey..."
  }
  ```

---

### Categorías (Categories)

Endpoints para gestionar las categorías de productos.

#### `POST /api/categories/create`

Crea una nueva categoría. `Requiere Admin`.

- **Body**: `JSON`
  - `name` (string, requerido): Nombre de la categoría.
  - `description` (string, opcional): Descripción de la categoría.
- **Respuesta**: `JSON` - El objeto de la categoría recién creada.
  ```json
  {
    "id": 1,
    "name": "Electrónicos",
    "description": "Dispositivos y gadgets electrónicos."
  }
  ```

#### `GET /api/categories`

Obtiene una lista de todas las categorías.

- **Respuesta**: `JSON` - Un array de objetos de categoría.
  ```json
  [
    {
      "id": 1,
      "name": "Electrónicos",
      "description": "Dispositivos y gadgets electrónicos."
    },
    {
      "id": 2,
      "name": "Libros",
      "description": "Libros de texto y novelas."
    }
  ]
  ```
---

### Productos (Products)

Endpoints para la gestión de productos.

#### `POST /api/products`

Crea un nuevo producto. `Requiere Admin`.

- **Body**: `FormData`
  - `name` (string, requerido): Nombre del producto.
  - `description` (string, opcional): Descripción detallada.
  - `sku` (string, requerido): SKU único del producto.
  - `price` (number, requerido): Precio del producto.
  - `stock` (integer, requerido): Cantidad en inventario.
  - `categoryId` (integer, requerido): ID de la categoría a la que pertenece.
  - `image` (file, opcional): Archivo de imagen del producto (`jpeg`, `png`, `webp`, etc.).
- **Respuesta**: `JSON` - El objeto del producto recién creado.
  ```json
  {
    "id": 101,
    "name": "Laptop Pro",
    "description": "Laptop de alto rendimiento.",
    "sku": "LP-001",
    "price": "1200.50",
    "stock": 50,
    "categoryId": 1,
    "imageUrl": "image-1678886400000.webp"
  }
  ```

#### `GET /api/products`

Obtiene una lista de todos los productos.

- **Query Params**:
  - `category` (string, opcional): Filtra los productos por el nombre de la categoría.
- **Ejemplo de URL**: `/api/products?category=Electrónicos`
- **Respuesta**: `JSON` - Un array de objetos de producto.
  ```json
  [
    {
      "id": 101,
      "name": "Laptop Pro",
      "price": "1200.50",
      "imageUrl": "image-1678886400000.webp",
      "Category": {
        "name": "Electrónicos"
      }
    }
  ]
  ```

#### `GET /api/products/:id`

Obtiene un producto específico por su ID.

- **URL Params**:
  - `id` (integer, requerido): ID del producto.
- **Respuesta**: `JSON` - El objeto del producto solicitado.

---

### Carrito (Cart)

Endpoints para gestionar el carrito de compras del usuario. `Requiere Autenticación`.

#### `GET /api/cart`

Obtiene el contenido del carrito del usuario actual.

- **Respuesta**: `JSON` - El objeto del carrito con sus ítems.
  ```json
  {
    "id": 1,
    "userId": 1,
    "CartItems": [
      {
        "quantity": 2,
        "Product": {
          "id": 101,
          "name": "Laptop Pro",
          "price": "1200.50"
        }
      }
    ]
  }
  ```

#### `POST /api/cart/add`

Añade un producto al carrito.

- **Body**: `JSON`
  - `productId` (integer, requerido): ID del producto a añadir.
  - `quantity` (integer, requerido): Cantidad a añadir.
- **Respuesta**: `JSON` - El ítem del carrito recién añadido o actualizado.

---

### Órdenes (Orders)

Endpoints para crear y consultar órdenes. `Requiere Autenticación`.

#### `POST /api/orders`

Crea una nueva orden a partir del carrito del usuario.

- **Body**: `JSON`
  - `address` (string, requerido): Dirección de envío.
  - `phone` (string, requerido): Número de teléfono de contacto.
- **Respuesta**: `JSON` - El objeto de la orden recién creada.

#### `GET /api/orders`

Obtiene el historial de órdenes del usuario actual.

- **Respuesta**: `JSON` - Un array de objetos de orden.

---

### Pagos (Payments)

Endpoints para procesar pagos con Stripe. `Requiere Autenticación`.

#### `POST /api/payments/create-checkout-session`

Crea una sesión de pago en Stripe para la orden pendiente del usuario.

- **Respuesta**: `JSON`
  - `sessionId` (string): El ID de la sesión de Stripe para redirigir al cliente.
  ```json
  {
    "sessionId": "cs_test_a1B2c3d4..."
  }
  ```
