// Body_login_login_access_tokenSchema
export const Body_login_login_access_tokenSchema = {
  properties: {
    grant_type: {
      anyOf: [
        {
          type: "string",
          pattern: "password",
        },
        {
          type: "null",
        },
      ],
      title: "Grant Type",
    },
    username: {
      type: "string",
      title: "Username",
    },
    password: {
      type: "string",
      title: "Password",
    },
    scope: {
      type: "string",
      title: "Scope",
      default: "",
    },
    client_id: {
      anyOf: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
      title: "Client Id",
    },
    client_secret: {
      anyOf: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
      title: "Client Secret",
    },
  },
  type: "object",
  required: ["username", "password"],
  title: "Body_login-login_access_token",
} as const;

// HTTPValidationErrorSchema
export const HTTPValidationErrorSchema = {
  properties: {
    detail: {
      items: {
        $ref: "#/components/schemas/ValidationError",
      },
      type: "array",
      title: "Detail",
    },
  },
  type: "object",
  title: "HTTPValidationError",
} as const;

// ItemCreateSchema
export const ItemCreateSchema = {
  properties: {
    item_name: {
      type: "string",
      maxLength: 255,
      minLength: 1,
      title: "Item Name",
    },
    current_room: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Current Room",
    },
    table_name: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Table Name",
    },
    system_name: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "System Name",
    },
    current_owner_id: {
      anyOf: [
        {
          type: "string",
          format: "uuid",
        },
        {
          type: "null",
        },
      ],
      title: "Current Owner Id",
    },
    taken_at: {
      anyOf: [
        {
          type: "string",
          format: "date-time",
        },
        {
          type: "null",
        },
      ],
      title: "Taken At",
    },
    item_img_url: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Item Image Url",
    },
    item_vendor: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Item Vendor",
    },
    item_params: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Item Params",
    },
    is_available: {
      type: "boolean",
      title: "Is Available",
      default: true,
    },
  },
  type: "object",
  required: ["item_name"],
  title: "ItemCreate",
} as const;

// ItemPublicSchema
export const ItemPublicSchema = {
  properties: {
    item_id: {
      type: "string",
      format: "uuid",
      title: "Item Id",
    },
    item_name: {
      type: "string",
      maxLength: 255,
      minLength: 1,
      title: "Item Name",
    },
    current_room: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Current Room",
    },
    table_name: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Table Name",
    },
    system_name: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "System Name",
    },
    current_owner_id: {
      anyOf: [
        {
          type: "string",
          format: "uuid",
        },
        {
          type: "null",
        },
      ],
      title: "Current Owner Id",
    },
    taken_at: {
      anyOf: [
        {
          type: "string",
          format: "date-time",
        },
        {
          type: "null",
        },
      ],
      title: "Taken At",
    },
    item_img_url: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Item Image Url",
    },
    item_vendor: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Item Vendor",
    },
    item_params: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Item Params",
    },
    is_available: {
      type: "boolean",
      title: "Is Available",
      default: true,
    },
  },
  type: "object",
  required: ["item_id", "item_name", "current_room", "item_img_url", "item_vendor", "item_params"],
  title: "ItemPublic",
} as const;

// ItemUpdateSchema
export const ItemUpdateSchema = {
  properties: {
    item_name: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
          minLength: 1,
        },
        {
          type: "null",
        },
      ],
      title: "Item Name",
    },
    item_img_url: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Item Image Url",
    },
    item_vendor: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Item Vendor",
    },
    item_params: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Item Params",
    },
  },
  type: "object",
  title: "ItemUpdate",
} as const;

// ItemsPublicSchema
export const ItemsPublicSchema = {
  properties: {
    data: {
      items: {
        $ref: "#/components/schemas/ItemPublic",
      },
      type: "array",
      title: "Data",
    },
    count: {
      type: "integer",
      title: "Count",
    },
  },
  type: "object",
  required: ["data", "count"],
  title: "ItemsPublic",
} as const;

// MessageSchema
export const MessageSchema = {
  properties: {
    message: {
      type: "string",
      title: "Message",
    },
  },
  type: "object",
  required: ["message"],
  title: "Message",
} as const;

// NewPasswordSchema
export const NewPasswordSchema = {
  properties: {
    token: {
      type: "string",
      title: "Token",
    },
    new_password: {
      type: "string",
      maxLength: 40,
      minLength: 8,
      title: "New Password",
    },
  },
  type: "object",
  required: ["token", "new_password"],
  title: "NewPassword",
} as const;

// TokenSchema
export const TokenSchema = {
  properties: {
    access_token: {
      type: "string",
      title: "Access Token",
    },
    token_type: {
      type: "string",
      title: "Token Type",
      default: "bearer",
    },
  },
  type: "object",
  required: ["access_token"],
  title: "Token",
} as const;

// UpdatePasswordSchema
export const UpdatePasswordSchema = {
  properties: {
    current_password: {
      type: "string",
      maxLength: 40,
      minLength: 8,
      title: "Current Password",
    },
    new_password: {
      type: "string",
      maxLength: 40,
      minLength: 8,
      title: "New Password",
    },
  },
  type: "object",
  required: ["current_password", "new_password"],
  title: "UpdatePassword",
} as const;

// UserCreateSchema
export const UserCreateSchema = {
  properties: {
    email: {
      type: "string",
      maxLength: 255,
      format: "email",
      title: "Email",
    },
    is_active: {
      type: "boolean",
      title: "Is Active",
      default: true,
    },
    is_superuser: {
      type: "boolean",
      title: "Is Superuser",
      default: false,
    },
    full_name: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Full Name",
    },
    password: {
      type: "string",
      maxLength: 40,
      minLength: 8,
      title: "Password",
    },
    is_part_of_lab: {
      type: "boolean",
      title: "Is Part Of Lab",
      default: false,
    },
    can_edit_items: {
      type: "boolean",
      title: "Can Edit Items",
      default: false,
    },
    can_edit_labs: {
      type: "boolean",
      title: "Can Edit Labs",
      default: false,
    },
    can_edit_users: {
      type: "boolean",
      title: "Can Edit Users",
      default: false,
    },
  },
  type: "object",
  required: ["email", "password"],
  title: "UserCreate",
} as const;

// UserPublicSchema
export const UserPublicSchema = {
  properties: {
    user_id: {
      type: "string",
      format: "uuid",
      title: "User Id",
    },
    email: {
      type: "string",
      maxLength: 255,
      format: "email",
      title: "Email",
    },
    is_active: {
      type: "boolean",
      title: "Is Active",
      default: true,
    },
    is_superuser: {
      type: "boolean",
      title: "Is Superuser",
      default: false,
    },
    full_name: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Full Name",
    },
    is_part_of_lab: {
      type: "boolean",
      title: "Is Part Of Lab",
      default: false,
    },
    can_edit_items: {
      type: "boolean",
      title: "Can Edit Items",
      default: false,
    },
    can_edit_labs: {
      type: "boolean",
      title: "Can Edit Labs",
      default: false,
    },
    can_edit_users: {
      type: "boolean",
      title: "Can Edit Users",
      default: false,
    },
  },
  type: "object",
  required: ["user_id", "email"],
  title: "UserPublic",
} as const;

// UserRegisterSchema
export const UserRegisterSchema = {
  properties: {
    email: {
      type: "string",
      maxLength: 255,
      format: "email",
      title: "Email",
    },
    password: {
      type: "string",
      maxLength: 40,
      minLength: 8,
      title: "Password",
    },
    full_name: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Full Name",
    },
  },
  type: "object",
  required: ["email", "password"],
  title: "UserRegister",
} as const;

// UserUpdateSchema
export const UserUpdateSchema = {
  properties: {
    email: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
          format: "email",
        },
        {
          type: "null",
        },
      ],
      title: "Email",
    },
    is_active: {
      type: "boolean",
      title: "Is Active",
      default: true,
    },
    is_superuser: {
      type: "boolean",
      title: "Is Superuser",
      default: false,
    },
    full_name: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Full Name",
    },
    password: {
      anyOf: [
        {
          type: "string",
          maxLength: 40,
          minLength: 8,
        },
        {
          type: "null",
        },
      ],
      title: "Password",
    },
    is_part_of_lab: {
      anyOf: [
        {
          type: "boolean",
        },
        {
          type: "null",
        },
      ],
      title: "Is Part Of Lab",
    },
    can_edit_items: {
      anyOf: [
        {
          type: "boolean",
        },
        {
          type: "null",
        },
      ],
      title: "Can Edit Items",
    },
    can_edit_labs: {
      anyOf: [
        {
          type: "boolean",
        },
        {
          type: "null",
        },
      ],
      title: "Can Edit Labs",
    },
    can_edit_users: {
      anyOf: [
        {
          type: "boolean",
        },
        {
          type: "null",
        },
      ],
      title: "Can Edit Users",
    },
  },
  type: "object",
  title: "UserUpdate",
} as const;

// UserUpdateMeSchema
export const UserUpdateMeSchema = {
  properties: {
    full_name: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Full Name",
    },
    email: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
          format: "email",
        },
        {
          type: "null",
        },
      ],
      title: "Email",
    },
  },
  type: "object",
  title: "UserUpdateMe",
} as const;

// UsersPublicSchema
export const UsersPublicSchema = {
  properties: {
    data: {
      items: {
        $ref: "#/components/schemas/UserPublic",
      },
      type: "array",
      title: "Data",
    },
    count: {
      type: "integer",
      title: "Count",
    },
  },
  type: "object",
  required: ["data", "count"],
  title: "UsersPublic",
} as const;

// ValidationErrorSchema
export const ValidationErrorSchema = {
  properties: {
    loc: {
      items: {
        anyOf: [
          {
            type: "string",
          },
          {
            type: "integer",
          },
        ],
      },
      type: "array",
      title: "Location",
    },
    msg: {
      type: "string",
      title: "Message",
    },
    type: {
      type: "string",
      title: "Error Type",
    },
  },
  type: "object",
  required: ["loc", "msg", "type"],
  title: "ValidationError",
} as const;

// RoomBaseSchema
export const RoomBaseSchema = {
  properties: {
    room_number: {
      type: "string",
      maxLength: 255,
      title: "Room Number",
    },
    room_place: {
      type: "string",
      maxLength: 255,
      title: "Room Place",
    },
    room_owner_id: {
      anyOf: [
        {
          type: "string",
          format: "uuid",
        },
        {
          type: "null",
        },
      ],
      title: "Room Owner Id",
    },
  },
  type: "object",
  required: ["room_number", "room_place"],
  title: "RoomBase",
} as const;

// RoomCreateSchema
export const RoomCreateSchema = {
  ...RoomBaseSchema,
  title: "RoomCreate",
} as const;

// RoomUpdateSchema
export const RoomUpdateSchema = {
  properties: {
    room_number: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Room Number",
    },
    room_place: {
      anyOf: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      title: "Room Place",
    },
    room_owner_id: {
      anyOf: [
        {
          type: "string",
          format: "uuid",
        },
        {
          type: "null",
        },
      ],
      title: "Room Owner Id",
    },
  },
  type: "object",
  title: "RoomUpdate",
} as const;

// RoomPublicSchema
export const RoomPublicSchema = {
  properties: {
    room_id: {
      type: "string",
      format: "uuid",
      title: "Room Id",
    },
    room_number: {
      type: "string",
      maxLength: 255,
      title: "Room Number",
    },
    room_place: {
      type: "string",
      maxLength: 255,
      title: "Room Place",
    },
    room_owner_id: {
      anyOf: [
        {
          type: "string",
          format: "uuid",
        },
        {
          type: "null",
        },
      ],
      title: "Room Owner Id",
    },
  },
  type: "object",
  required: ["room_id", "room_number", "room_place"],
  title: "RoomPublic",
} as const;

// RoomsPublicSchema
export const RoomsPublicSchema = {
  properties: {
    data: {
      items: {
        $ref: "#/components/schemas/RoomPublic",
      },
      type: "array",
      title: "Data",
    },
    count: {
      type: "integer",
      title: "Count",
    },
  },
  type: "object",
  required: ["data", "count"],
  title: "RoomsPublic",
} as const;