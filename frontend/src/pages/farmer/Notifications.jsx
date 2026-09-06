import { useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  Info,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
} from "../../services/api";

import { getLoggedInUser } from "../../utils/auth";
import Loading from "../../components/Loading";

export default function Notifications() {
  const user = getLoggedInUser("farmer");

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await getNotifications(user.id);

      setNotifications(
        response.notifications || []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, read: true }
            : item
        )
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to update notification."
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);

      setNotifications((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to delete notification."
      );
    }
  };

  const handleReadAll = async () => {
    const unread = notifications.filter(
      (item) => !item.read
    );

    try {
      await Promise.all(
        unread.map((item) =>
          markNotificationRead(item.id)
        )
      );

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          read: true,
        }))
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to mark notifications as read."
      );
    }
  };

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return (
          <CheckCircle2
            size={20}
            className="text-emerald-600"
          />
        );

      case "warning":
        return (
          <AlertTriangle
            size={20}
            className="text-orange-600"
          />
        );

      default:
        return (
          <Info
            size={20}
            className="text-blue-600"
          />
        );
    }
  };

  const getIconBackground = (type) => {
    switch (type) {
      case "success":
        return "bg-emerald-100";

      case "warning":
        return "bg-orange-100";

      default:
        return "bg-blue-100";
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "";
    }

    return value.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
   <div className="notifications-page space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Stay updated about your crops, bookings and orders.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleReadAll}
            className="sf-button sf-button-secondary inline-flex items-center justify-center gap-2"
          >
            <CheckCheck size={18} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sf-card p-5">
          <p className="text-sm text-slate-500">
            Total Notifications
          </p>

          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {notifications.length}
          </p>
        </div>

        <div className="sf-card p-5">
          <p className="text-sm text-slate-500">
            Unread
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#18864b]">
            {unreadCount}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && <Loading />}

      {/* Notifications */}
      {!loading && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`sf-card p-4 transition ${
                notification.read
                  ? "opacity-80"
                  : "border-l-4 border-l-[#18864b]"
              }`}
            >
              <div className="flex gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${getIconBackground(
                    notification.type
                  )}`}
                >
                  {getIcon(notification.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {notification.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {notification.message}
                      </p>
                    </div>

                    {!notification.read && (
                      <span className="w-fit rounded-full bg-[#e7f6ed] px-2.5 py-1 text-[11px] font-bold text-[#18864b]">
                        NEW
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock size={13} />
                      {formatDate(
                        notification.createdAt
                      )}
                    </span>

                    <div className="ml-auto flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={() =>
                            handleRead(
                              notification.id
                            )
                          }
                          className="rounded-lg px-3 py-1.5 text-xs font-bold text-[#18864b] hover:bg-[#e7f6ed]"
                        >
                          Mark read
                        </button>
                      )}

                      <button
                        onClick={() =>
                          handleDelete(
                            notification.id
                          )
                        }
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete notification"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && notifications.length === 0 && (
        <div className="sf-card flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#e7f6ed] text-[#18864b]">
            <Bell size={30} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            No notifications yet
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Booking updates, order updates and other important
            alerts will appear here.
          </p>
        </div>
      )}
    </div>
  );
}