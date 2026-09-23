"use client";

import type { FormEvent } from "react";

export function ConfirmDeleteButton({
  action,
  message,
}: {
  action: () => Promise<void>;
  message: string;
}) {
  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(message)) event.preventDefault();
  }

  return (
    <form action={action} onSubmit={confirmDelete}>
      <button className="button button--danger" type="submit">删除</button>
    </form>
  );
}
