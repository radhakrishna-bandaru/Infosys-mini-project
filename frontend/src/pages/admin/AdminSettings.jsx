import { useEffect, useState } from "react";
import {
  Settings,
  Bell,
  ShieldCheck,
  Database,
  Globe,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Camera,
} from "lucide-react";

const SETTINGS_KEY = "smartFarmerAdminSettings";

const DEFAULT_SETTINGS = {
  platformName: "Smart Farmer",
  defaultLanguage: "English",
  notifications: true,
  emailAlerts: true,
  bookingAlerts: true,
  orderAlerts: true,
  maintenanceMode: false,
  allowRegistration: true,
  requireStorageVerification: true,
};

export default function AdminSettings() {
  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
const [profileImage, setProfileImage] = useState(() => {
  const saved = localStorage.getItem("adminProfile");

  if (!saved) return "";

  try {
    return JSON.parse(saved)?.profileImage || "";
  } catch {
    return "";
  }
});
  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        SETTINGS_KEY
      );

      if (stored) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...JSON.parse(stored),
        });
      }
    } catch {
      setError(
        "Unable to load saved settings."
      );
    }
  }, []);
function handleProfileImage(e) {
  const file = e.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select an image file.");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("Image size should be below 2MB.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const image = reader.result;

    setProfileImage(image);

    const oldProfile = JSON.parse(
      localStorage.getItem("adminProfile") || "{}"
    );

    localStorage.setItem(
      "adminProfile",
      JSON.stringify({
        ...oldProfile,
        profileImage: image,
      })
    );
  };

  reader.readAsDataURL(file);
}

function deleteProfileImage() {
  setProfileImage("");

  const oldProfile = JSON.parse(
    localStorage.getItem("adminProfile") || "{}"
  );

  localStorage.setItem(
    "adminProfile",
    JSON.stringify({
      ...oldProfile,
      profileImage: "",
    })
  );
}
  function updateSetting(key, value) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
    setError("");
  }

  function handleSave() {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
      );

      setSaved(true);
      setError("");

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch {
      setError(
        "Unable to save settings."
      );
    }
  }

  function handleReset() {
    const confirmed = window.confirm(
      "Reset all admin settings to default?"
    );

    if (!confirmed) return;

    setSettings(DEFAULT_SETTINGS);

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(DEFAULT_SETTINGS)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  }

  return (
    <div className="admin-settings-page space-y-6 pb-10">
      {/* HEADER */}
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f6b3d] via-[#18864b] to-[#42a96c] p-6 text-white shadow-[0_18px_45px_rgba(24,134,75,0.18)] sm:p-8">
  <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
    <div className="min-w-0">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
        <Settings size={14} />
        ADMIN CONTROL
      </div>

      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
        Platform Settings
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px]">
        Configure Smart Farmer platform preferences,
        notifications, security and system controls.
      </p>
    </div>

    <div className="flex shrink-0 flex-wrap gap-2">
      <button
        type="button"
        onClick={handleReset}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
      >
        <RotateCcw size={17} />
        Reset
      </button>

      <button
        type="button"
        onClick={handleSave}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#176b3d] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f5fff7]"
      >
        <Save size={17} />
        Save Changes
      </button>
    </div>
  </div>

  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10" />
  <div className="pointer-events-none absolute -bottom-24 right-24 h-52 w-52 rounded-full bg-white/5" />
</div>
      {/* SUCCESS */}
      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 size={19} />

          <span className="font-medium">
            Settings saved successfully.
          </span>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} />

          <span>{error}</span>
        </div>
      )}

     {/* PLATFORM */}
<section className="sf-card overflow-hidden">

  <SectionHeader
    icon={<Settings size={19} />}
    title="Platform Configuration"
    description="Basic platform information."
  />

  {/* ADMIN PROFILE */}

  <div className="border-b border-gray-100 bg-[#f8fbf8] px-5 py-6 sm:px-7">

    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

      {/* PROFILE PHOTO */}

      <div className="relative shrink-0">

        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-[#18864b] text-3xl font-black text-white shadow-[0_10px_25px_rgba(24,134,75,0.18)]">

          {profileImage ? (
            <img
              src={profileImage}
              alt="Admin profile"
              className="h-full w-full object-cover"
            />
          ) : (
            "A"
          )}

        </div>

        {/* CHANGE PHOTO */}

        <label
          htmlFor="admin-profile-image"
          className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-2 border-white bg-[#17351f] text-white shadow-lg transition hover:scale-105 hover:bg-[#126b3c]"
          title="Change profile photo"
        >
          <Camera size={16} />
        </label>

        <input
          id="admin-profile-image"
          type="file"
          accept="image/*"
          onChange={handleProfileImage}
          className="hidden"
        />

        {/* DELETE PHOTO */}

        {profileImage && (
          <button
            type="button"
            onClick={deleteProfileImage}
            className="absolute -bottom-2 -left-2 flex h-8 w-8 items-center justify-center rounded-xl border-2 border-white bg-red-500 text-white shadow-md transition hover:scale-105 hover:bg-red-600"
            title="Remove profile photo"
          >
            ×
          </button>
        )}

      </div>

      {/* ADMIN DETAILS */}

      <div className="min-w-0">

        <div className="flex flex-wrap items-center gap-3">

          <h3 className="text-xl font-black text-[#17351f]">
            Administrator
          </h3>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#18864b] shadow-sm">
            <ShieldCheck size={14} />
            Verified Account
          </span>

        </div>

        <p className="mt-1 text-sm text-gray-500">
          Manage your administrator profile photo.
        </p>

        <p className="mt-2 text-xs font-medium text-gray-400">
          JPG, PNG or WEBP • Maximum 2MB
        </p>

      </div>

    </div>

  </div>

  {/* PLATFORM SETTINGS */}

  <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">

    <Field
      label="Platform Name"
      description="Name displayed across the platform."
    >
      <input
        value={settings.platformName}
        onChange={(e) =>
          updateSetting(
            "platformName",
            e.target.value
          )
        }
        className="sf-input"
      />
    </Field>

    <Field
      label="Default Language"
      description="Default language for the platform."
    >
      <select
        value={settings.defaultLanguage}
        onChange={(e) =>
          updateSetting(
            "defaultLanguage",
            e.target.value
          )
        }
        className="sf-input"
      >
        <option value="English">
          English
        </option>

        <option value="Telugu">
          Telugu
        </option>

        <option value="Hindi">
          Hindi
        </option>
      </select>
    </Field>

  </div>

</section>
      {/* NOTIFICATIONS */}
      <section className="sf-card overflow-hidden">
        <SectionHeader
          icon={<Bell size={19} />}
          title="Notifications"
          description="Control platform notification preferences."
        />

        <div className="divide-y divide-gray-100">
          <ToggleRow
            title="Platform Notifications"
            description="Enable general platform notifications."
            checked={settings.notifications}
            onChange={(value) =>
              updateSetting(
                "notifications",
                value
              )
            }
          />

          <ToggleRow
            title="Email Alerts"
            description="Allow email-based system alerts."
            checked={settings.emailAlerts}
            onChange={(value) =>
              updateSetting(
                "emailAlerts",
                value
              )
            }
          />

          <ToggleRow
            title="Booking Alerts"
            description="Notify when storage bookings are created or updated."
            checked={settings.bookingAlerts}
            onChange={(value) =>
              updateSetting(
                "bookingAlerts",
                value
              )
            }
          />

          <ToggleRow
            title="Order Alerts"
            description="Notify users when order status changes."
            checked={settings.orderAlerts}
            onChange={(value) =>
              updateSetting(
                "orderAlerts",
                value
              )
            }
          />
        </div>
      </section>

      {/* SECURITY */}
      <section className="sf-card overflow-hidden">
        <SectionHeader
          icon={<ShieldCheck size={19} />}
          title="Security & Access"
          description="Control registration and verification policies."
        />

        <div className="divide-y divide-gray-100">
          <ToggleRow
            title="Allow New Registrations"
            description="Allow new farmers, buyers and storage owners to register."
            checked={settings.allowRegistration}
            onChange={(value) =>
              updateSetting(
                "allowRegistration",
                value
              )
            }
          />

          <ToggleRow
            title="Require Storage Verification"
            description="New storage facilities require admin verification."
            checked={
              settings.requireStorageVerification
            }
            onChange={(value) =>
              updateSetting(
                "requireStorageVerification",
                value
              )
            }
          />
        </div>
      </section>

      {/* SYSTEM */}
      <section className="sf-card overflow-hidden">
        <SectionHeader
          icon={<Database size={19} />}
          title="System Controls"
          description="Important platform-level controls."
        />

        <div className="divide-y divide-gray-100">
          <ToggleRow
            title="Maintenance Mode"
            description="Temporarily restrict normal platform access during maintenance."
            checked={settings.maintenanceMode}
            onChange={(value) =>
              updateSetting(
                "maintenanceMode",
                value
              )
            }
            danger
          />
        </div>
      </section>

      {/* STATUS */}
      <section className="rounded-3xl bg-[#16351f] p-6 text-white sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Globe size={20} />

              <h2 className="text-lg font-bold">
                Platform Status
              </h2>
            </div>

            <p className="mt-2 text-sm text-white/70">
              Smart Farmer is currently configured
              for normal operation.
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-semibold ${
              settings.maintenanceMode
                ? "bg-red-500/20 text-red-200"
                : "bg-green-500/20 text-green-200"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                settings.maintenanceMode
                  ? "bg-red-400"
                  : "bg-green-400"
              }`}
            />

            {settings.maintenanceMode
              ? "Maintenance Mode"
              : "Operational"}
          </div>
        </div>
      </section>

      {/* BOTTOM SAVE */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="sf-button"
        >
          <Save size={17} />
          Save Changes
        </button>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}) {
  return (
    <div className="border-b border-[#e8eee9] bg-[#f8fbf8] px-5 py-5 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ec] text-[#18864b]">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[#16351f]">
            {title}
          </h2>

          <p className="mt-1 text-sm text-[#7b8981]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  description,
  children,
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">
        {label}
      </label>

      <p className="mb-2 mt-1 text-xs text-gray-400">
        {description}
      </p>

      {children}
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  danger = false,
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-[#edf1ed] px-5 py-5 last:border-b-0 sm:px-6">
      <div className="min-w-0">
        <p
          className={`text-sm font-bold ${
            danger ? "text-red-700" : "text-[#263b2d]"
          }`}
        >
          {title}
        </p>

        <p className="mt-1 max-w-3xl text-xs leading-5 text-[#8a978f]">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full p-0.5 transition-all duration-200 ${
          checked
            ? danger
              ? "bg-red-500"
              : "bg-[#18864b]"
            : "bg-[#d9e1db]"
        }`}
        aria-pressed={checked}
        aria-label={title}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200 ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}