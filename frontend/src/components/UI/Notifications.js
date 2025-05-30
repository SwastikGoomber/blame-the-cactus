import React from "react";

export const Notifications = ({ notifications }) => {
  return (
    <div className="fixed top-4 right-4 z-40 space-y-2">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`p-3 rounded-lg pixelated text-sm max-w-sm animate-fade-in ${
            notif.type === "blame"
              ? "bg-red-500 text-white"
              : notif.type === "cultist"
              ? "bg-purple-500 text-white"
              : notif.type === "moderator"
              ? "bg-blue-500 text-white"
              : notif.type === "source"
              ? "bg-green-500 text-white"
              : notif.type === "growth"
              ? "bg-blue-500 text-white"
              : notif.type === "warning"
              ? "bg-orange-500 text-white"
              : notif.type === "farm"
              ? "bg-purple-500 text-white"
              : notif.type === "purchase"
              ? "bg-yellow-500 text-white"
              : notif.type === "plant"
              ? "bg-green-600 text-white"
              : "bg-gray-700 text-white"
          }`}
        >
          {notif.message}
        </div>
      ))}
    </div>
  );
};
