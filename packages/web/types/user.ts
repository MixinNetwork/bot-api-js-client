export interface User {
  type: 'user'
  user_id: string
  identity_number: string
  phone: string
  full_name: string
  biography: string
  avatar_url: string
  relationship: string
  mute_until: string
  created_at: string
  is_verified: boolean
  app?: App
  session_id?: string
  pin_token?: string
  pin_token_base64?: string
  code_id?: string
  code_url?: string
  has_pin?: boolean
  has_emergency_contact?: boolean
  receive_message_source?: string
  accept_conversation_source?: string
  accept_search_source?: string
  fiat_currency?: string
  device_status?: string

  publick_key?: string
  private_key?: string
}

export interface App {
  updated_at: string
  app_id: string
  app_number: string
  redirect_url: string
  home_url: string
  name: string
  icon_url: string
  description: string
  capabilities: string[]
  resource_patterns: string[]
  category: string
  creator_id: string
  app_secret: string
}
export interface Conversation {
  conversation_id: string
  creator_id: string
  category: string
  name: string
  icon_url: string
  announcement: string
  created_at: string
  code_id: string
  code_url: string

  participants: Participant[]
}
export type ConversationRole = "OWNER" | "ADMIN" | ""
export interface Participant {
  user_id: string
  type?: "participant"
  role?: ConversationRole
  created_at?: string
}

export interface Scope {
  profile: boolean
  phone?: boolean
  contacts?: boolean
  assets?: boolean
  snapshots?: boolean
  messages?: boolean
};

export interface AuthParams {
  client_id: string
  return_to?: string
  scope?: Scope
  state?: string
  useCDN?: boolean
}