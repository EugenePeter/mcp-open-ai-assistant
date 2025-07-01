export type ChatSidebarProps = {
  messages?: Array<{ id: string; role: string; text: string }> | [];
};

export type Message = {
  messages?: Array<{ id: string; role: string; text: string }>;
};
