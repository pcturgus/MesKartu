"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsRead,
} from "@/app/notifications/actions";
import { Modal } from "@/components/Modal";
import type { AppNotification } from "@/types/database";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "ką tik";
  if (min < 60) return `prieš ${min} min.`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `prieš ${hr} val.`;
  const d = Math.floor(hr / 24);
  return `prieš ${d} d.`;
}

// A bell icon with an unread-count badge. Polls the count every ~30s so it
// stays current without a page reload; opening the panel loads the recent
// list and marks everything read (the just-fetched read/unread snapshot is
// still shown highlighted, so what was new is still visible after opening).
export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<AppNotification[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const count = await getUnreadNotificationsCount();
      if (!cancelled) setUnread(count);
    }
    poll();
    const id = setInterval(poll, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  async function handleOpen() {
    setOpen(true);
    const list = await getNotifications();
    setItems(list);
    if (list.some((n) => !n.read)) {
      await markAllNotificationsRead();
      setUnread(0);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        title="Pranešimai"
        aria-label="Pranešimai"
        className="relative rounded-full border border-line w-9 h-9 flex items-center justify-center text-ink-soft"
      >
        🔔
        {unread > 0 && (
          <span
            className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[0.6rem] font-bold text-white"
            style={{ background: "var(--ember)" }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 className="mb-3 text-sm font-bold" style={{ color: "var(--dusk)" }}>
          Pranešimai
        </h3>
        {items === null ? (
          <p className="text-sm text-ink-faint">Kraunama...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-ink-faint">Kol kas jokių pranešimų.</p>
        ) : (
          <ul className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
            {items.map((n) => {
              const row = (
                <>
                  <div className="text-ink">{n.message}</div>
                  <div className="mt-0.5 text-xs text-ink-faint">{timeAgo(n.created_at)}</div>
                </>
              );
              const className = `block rounded-lg border border-line px-3 py-2.5 text-sm ${
                !n.read ? "bg-surface-2" : ""
              }`;
              return (
                <li key={n.id}>
                  {n.href ? (
                    <Link href={n.href} onClick={() => setOpen(false)} className={className}>
                      {row}
                    </Link>
                  ) : (
                    <div className={className}>{row}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Modal>
    </>
  );
}
