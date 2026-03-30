export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "SlowWork API",
    version: "1.0.0",
    description:
      "REST API for SlowWork — a freelance marketplace platform. All protected routes require a Bearer access token in the `Authorization` header.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Access token obtained from /auth/login or /auth/refresh",
      },
    },
    schemas: {
      // ── Auth ────────────────────────────────────────────────────────────
      RegisterRequest: {
        type: "object",
        required: ["email", "password", "name", "role"],
        properties: {
          email: { type: "string", format: "email", example: "tony@email.com" },
          password: { type: "string", minLength: 6, example: "secret123" },
          name: { type: "string", example: "Tony Somboon" },
          role: { type: "string", enum: ["CLIENT", "FREELANCER"] },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "tony@email.com" },
          password: { type: "string", example: "secret123" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          accessToken: {
            type: "string",
            description: "Short-lived JWT (2 min)",
          },
        },
      },
      // ── User ────────────────────────────────────────────────────────────
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          email: { type: "string" },
          name: { type: "string" },
          avatar_url: { type: "string", nullable: true },
          role: { type: "string", enum: ["CLIENT", "FREELANCER"] },
          joined_at: { type: "string", format: "date-time" },
        },
      },
      UpdateUserRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          avatar_url: { type: "string", nullable: true },
        },
      },
      // ── Freelancer ──────────────────────────────────────────────────────
      FreelancerProfile: {
        type: "object",
        properties: {
          id: { type: "integer" },
          bio: { type: "string", nullable: true },
          tagline: { type: "string", nullable: true },
          location: { type: "string", nullable: true },
          avg_rating: { type: "number" },
          total_review: { type: "integer" },
          user: {
            type: "object",
            properties: {
              name: { type: "string" },
              avatar_url: { type: "string", nullable: true },
              joined_at: { type: "string", format: "date-time" },
            },
          },
          freelancerSkills: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "integer" },
                skill: { type: "string" },
              },
            },
          },
        },
      },
      UpdateFreelancerRequest: {
        type: "object",
        properties: {
          bio: { type: "string", nullable: true },
          tagline: { type: "string", nullable: true },
          location: { type: "string", nullable: true },
        },
      },
      // ── Service ─────────────────────────────────────────────────────────
      Service: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          cover_image_url: { type: "string", nullable: true },
          price: { type: "number" },
          delivery_days: { type: "integer" },
          status: { type: "string", enum: ["ACTIVE", "PAUSED", "DELETED"] },
          category: {
            type: "object",
            properties: {
              name: { type: "string" },
              slug: { type: "string" },
            },
          },
          freelancer_profile: {
            type: "object",
            properties: {
              avg_rating: { type: "number" },
              total_review: { type: "integer" },
              user: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  avatar_url: { type: "string", nullable: true },
                },
              },
            },
          },
        },
      },
      CreateServiceRequest: {
        type: "object",
        required: ["title", "price", "deliveryDays", "categoryId"],
        properties: {
          title: {
            type: "string",
            minLength: 10,
            maxLength: 100,
            example: "I will build a React app",
          },
          description: {
            type: "string",
            nullable: true,
            example: "Full-stack app with TypeScript...",
          },
          categoryId: { type: "integer", example: 1 },
          price: { type: "number", example: 3500 },
          deliveryDays: { type: "integer", example: 7 },
          image: {
            type: "string",
            nullable: true,
            description: "Cloudinary URL",
          },
        },
      },
      // ── Order ───────────────────────────────────────────────────────────
      Order: {
        type: "object",
        properties: {
          id: { type: "integer" },
          status: {
            type: "string",
            enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
          },
          price_at_order: { type: "number" },
          due_date: { type: "string", format: "date-time" },
          note: { type: "string", nullable: true },
          created_at: { type: "string", format: "date-time" },
          service: {
            type: "object",
            properties: {
              title: { type: "string" },
              cover_image_url: { type: "string", nullable: true },
              delivery_days: { type: "integer" },
              category: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  slug: { type: "string" },
                },
              },
            },
          },
        },
      },
      CreateOrderRequest: {
        type: "object",
        required: ["serviceId"],
        properties: {
          serviceId: { type: "integer", example: 2 },
          note: {
            type: "string",
            nullable: true,
            example: "Please use a dark color palette",
          },
        },
      },
      UpdateOrderStatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["IN_PROGRESS", "COMPLETED", "CANCELLED"],
            description:
              "Freelancers: PENDING→IN_PROGRESS|CANCELLED, IN_PROGRESS→COMPLETED|CANCELLED. Clients: PENDING→CANCELLED only.",
          },
        },
      },
      // ── Review ──────────────────────────────────────────────────────────
      Review: {
        type: "object",
        properties: {
          id: { type: "integer" },
          rating: { type: "integer", minimum: 1, maximum: 5 },
          comment: { type: "string", nullable: true },
          created_at: { type: "string", format: "date-time" },
          client: {
            type: "object",
            properties: {
              name: { type: "string" },
              avatar_url: { type: "string", nullable: true },
            },
          },
        },
      },
      CreateReviewRequest: {
        type: "object",
        required: ["orderId", "rating"],
        properties: {
          orderId: { type: "integer", example: 5 },
          rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
          comment: {
            type: "string",
            nullable: true,
            example: "Excellent work!",
          },
        },
      },
      // ── Upload ──────────────────────────────────────────────────────────
      UploadResponse: {
        type: "object",
        properties: {
          url: { type: "string", description: "Cloudinary secure URL" },
          publicId: { type: "string", description: "Cloudinary public ID" },
        },
      },
      // ── Error ───────────────────────────────────────────────────────────
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },

  paths: {
    // ── Auth ──────────────────────────────────────────────────────────────
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Registered successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: { description: "Email already in use" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful — sets HttpOnly refresh cookie",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token using HttpOnly refresh cookie",
        responses: {
          200: {
            description: "New access token issued",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          401: { description: "Missing or invalid refresh token" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout — clears refresh cookie",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Logged out successfully" },
        },
      },
    },

    // ── User ──────────────────────────────────────────────────────────────
    "/api/user/me": {
      get: {
        tags: ["User"],
        summary: "Get current authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "User object",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          401: { description: "Unauthorized" },
          404: { description: "User not found" },
        },
      },
    },
    "/api/user/update": {
      patch: {
        tags: ["User"],
        summary: "Update name or avatar URL",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateUserRequest" },
            },
          },
        },
        responses: {
          201: { description: "Updated successfully" },
          401: { description: "Unauthorized" },
        },
      },
    },

    // ── Freelancer ────────────────────────────────────────────────────────
    "/api/freelancer/profile/{name}": {
      get: {
        tags: ["Freelancer"],
        summary: "Get freelancer profile by username",
        parameters: [
          {
            name: "name",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "Supachai Namjimgai",
          },
        ],
        responses: {
          200: {
            description: "Freelancer profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/FreelancerProfile" },
              },
            },
          },
          404: { description: "Not found" },
        },
      },
    },
    "/api/freelancer/{id}": {
      get: {
        tags: ["Freelancer"],
        summary: "Get freelancer profile by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Freelancer profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/FreelancerProfile" },
              },
            },
          },
          404: { description: "Not found" },
        },
      },
    },
    "/api/freelancer/me": {
      patch: {
        tags: ["Freelancer"],
        summary: "Update own freelancer profile (bio, tagline, location)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateFreelancerRequest" },
            },
          },
        },
        responses: {
          200: { description: "Updated" },
          401: { description: "Unauthorized" },
          403: {
            description:
              "Forbidden — clients cannot update a freelancer profile",
          },
        },
      },
    },
    "/api/freelancer/me/skill": {
      post: {
        tags: ["Freelancer"],
        summary: "Add a skill to the freelancer profile",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["skill"],
                properties: { skill: { type: "string", example: "React" } },
              },
            },
          },
        },
        responses: {
          201: { description: "Skill added" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/freelancer/me/skill/{id}": {
      delete: {
        tags: ["Freelancer"],
        summary: "Delete a skill from the freelancer profile",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Skill deleted" },
          404: { description: "Skill not found" },
        },
      },
    },

    // ── Category ──────────────────────────────────────────────────────────
    "/api/category": {
      get: {
        tags: ["Category"],
        summary: "Get all categories",
        responses: {
          200: {
            description: "List of categories",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      name: { type: "string" },
                      slug: { type: "string" },
                      icon_url: { type: "string", nullable: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/categories/search": {
      get: {
        tags: ["Category"],
        summary: "Search category by slug",
        parameters: [
          {
            name: "slug",
            in: "query",
            required: true,
            schema: { type: "string" },
            example: "web-development",
          },
        ],
        responses: {
          200: { description: "Matching category" },
          404: { description: "Not found" },
        },
      },
    },

    // ── Service ───────────────────────────────────────────────────────────
    "/api/services": {
      get: {
        tags: ["Service"],
        summary: "Get all active services",
        responses: {
          200: {
            description: "List of services",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Service" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Service"],
        summary: "Create a new service (freelancer only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateServiceRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Service created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Service" },
              },
            },
          },
          400: { description: "Missing required fields" },
          404: { description: "Freelancer profile not found" },
        },
      },
    },
    "/api/services/search": {
      get: {
        tags: ["Service"],
        summary: "Search services by title or description",
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            schema: { type: "string" },
            example: "logo design",
          },
        ],
        responses: {
          200: {
            description: "Matching services",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Service" },
                },
              },
            },
          },
          400: { description: "Query param q is required" },
        },
      },
    },
    "/api/services/me": {
      get: {
        tags: ["Service"],
        summary: "Get current freelancer's services",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Freelancer's services" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/services/{id}": {
      get: {
        tags: ["Service"],
        summary: "Get a service by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 2,
          },
        ],
        responses: {
          200: {
            description: "Service detail",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Service" },
              },
            },
          },
          404: { description: "Not found" },
        },
      },
      put: {
        tags: ["Service"],
        summary: "Update a service (owner only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateServiceRequest" },
            },
          },
        },
        responses: {
          200: { description: "Updated service" },
          404: { description: "Service not found or unauthorized" },
        },
      },
    },
    "/api/services/{id}/status": {
      patch: {
        tags: ["Service"],
        summary: "Update service status (ACTIVE / PAUSED / DELETED)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    type: "string",
                    enum: ["ACTIVE", "PAUSED", "DELETED"],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Status updated" },
          404: { description: "Service not found or unauthorized" },
        },
      },
    },

    // ── Order ─────────────────────────────────────────────────────────────
    "/api/orders": {
      post: {
        tags: ["Order"],
        summary: "Place a new order (client only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateOrderRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Order placed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Order" },
              },
            },
          },
          404: { description: "Service not found" },
          409: { description: "Service unavailable" },
        },
      },
    },
    "/api/orders/me": {
      get: {
        tags: ["Order"],
        summary: "Get all orders placed by the current client",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Client's orders",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Order" },
                },
              },
            },
          },
        },
      },
    },
    "/api/orders/incoming": {
      get: {
        tags: ["Order"],
        summary: "Get all incoming orders for the current freelancer",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Incoming orders" },
          404: { description: "Freelancer profile not found" },
        },
      },
    },
    "/api/orders/{id}": {
      get: {
        tags: ["Order"],
        summary:
          "Get a specific order by ID (must be owner or assigned freelancer)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Order detail",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Order" },
              },
            },
          },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
    },
    "/api/orders/{id}/status": {
      patch: {
        tags: ["Order"],
        summary: "Update order status",
        description:
          "**Freelancer:** PENDING → IN_PROGRESS | CANCELLED · IN_PROGRESS → COMPLETED | CANCELLED\n\n**Client:** PENDING → CANCELLED only",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateOrderStatusRequest" },
            },
          },
        },
        responses: {
          200: { description: "Status updated" },
          403: { description: "Forbidden or transition not allowed" },
          409: { description: "Order already locked (completed/cancelled)" },
        },
      },
    },

    // ── Review ────────────────────────────────────────────────────────────
    "/api/reviews": {
      post: {
        tags: ["Review"],
        summary: "Submit a review for a completed order (client only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateReviewRequest" },
            },
          },
        },
        responses: {
          201: { description: "Review submitted" },
          409: { description: "Already reviewed or order not completed" },
        },
      },
    },
    "/api/reviews/freelancer/{freelancerProfileId}": {
      get: {
        tags: ["Review"],
        summary: "Get all reviews for a freelancer",
        parameters: [
          {
            name: "freelancerProfileId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "List of reviews",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Review" },
                },
              },
            },
          },
          404: { description: "Freelancer profile not found" },
        },
      },
    },

    // ── Upload ────────────────────────────────────────────────────────────
    "/api/upload/service-image": {
      post: {
        tags: ["Upload"],
        summary: "Upload a service cover image to Cloudinary (freelancer only)",
        description:
          "Sends file to Cloudinary under `slowwork/services/<freelancer-name>/`. Returns the Cloudinary URL.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["image"],
                properties: {
                  image: {
                    type: "string",
                    format: "binary",
                    description: "JPEG, PNG, WebP or GIF · max 5 MB",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Upload successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UploadResponse" },
              },
            },
          },
          400: { description: "No file provided" },
          404: { description: "Freelancer profile not found" },
        },
      },
    },
    "/api/upload/avatar": {
      post: {
        tags: ["Upload"],
        summary: "Upload and crop a user avatar to Cloudinary",
        description:
          "Sends file to Cloudinary under `slowwork/avatars/<user-name>/` and updates `user.avatar_url` in the database.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["image"],
                properties: {
                  image: {
                    type: "string",
                    format: "binary",
                    description: "JPEG, PNG or WebP · max 5 MB",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Avatar uploaded and user record updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UploadResponse" },
              },
            },
          },
          400: { description: "No file provided" },
          404: { description: "User not found" },
        },
      },
    },
  },
};
