import { useState } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Sprout,
  ShieldCheck,
  Save,
  Camera,
  Bell,
  Mic,
  Globe2,
  ChevronRight,
  CheckCircle2,
  Leaf,
  Sparkles,
  TrendingUp,
  Warehouse,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getStorage, setStorage } from "../../utils/storage";
import { getLoggedInUser } from "../../utils/auth";

const defaultProfile = {
  name: "",
  phone: "",
  email: "",
  village: "",
  district: "",
  state: "Andhra Pradesh",
  pincode: "",
  farmSize: "",
  crops: "",
  experience: "",
  language: "English",
  notifications: true,
  voiceAssistant: true,
  marketingAlerts: false,
};

export default function Profile() {
  const loggedUser = getLoggedInUser("farmer");

  const [profile, setProfile] = useState(() => {
    const saved = getStorage(
      "farmerProfile",
      null
    );

    return {
      ...defaultProfile,
      name:
        saved?.name ||
        loggedUser?.name ||
        "",
      phone:
        saved?.phone ||
        loggedUser?.phone ||
        "",
      email:
        saved?.email ||
        loggedUser?.email ||
        "",
      ...saved,
    };
  });

  const [saved, setSaved] = useState(false);
const [profileImage, setProfileImage] = useState(() => {
  const saved = getStorage("farmerProfile", null);
  return saved?.profileImage || "";
});

const handleProfileImage = (e) => {
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

setProfile((prev) => {
  const updatedProfile = {
    ...prev,
    profileImage: image,
  };

  setStorage("farmerProfile", updatedProfile);

  return updatedProfile;
});
  };

  reader.readAsDataURL(file);
};
  const updateField = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();

    setStorage(
      "farmerProfile",
      profile
    );

    const updatedUser = {
      ...(loggedUser || {}),
      name: profile.name,
      phone: profile.phone,
      email: profile.email,
    };

    setStorage(
      "farmerUser",
      updatedUser
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const initials =
    profile.name
      ?.split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "FR";

  return (
    <DashboardLayout>
      <div className="profile-page space-y-6 pb-10">

        {/* Header */}
        <section>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-[#1d3024]">
            My Profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#748179]">
            Manage your farmer information, farm details,
            language and Smart Farmer preferences.
          </p>
        </section>

        {/* Profile Hero */}
        <section className="sf-card overflow-hidden">
          <div className="relative bg-gradient-to-br from-[#0f6b3d] via-[#18864b] to-[#42a96c] p-6 sm:p-8">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-[-60px] right-20 h-40 w-40 rounded-full bg-[#baf0c7]/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[26px] bg-white text-2xl font-black text-[#18864b] shadow-xl">
  {profileImage ? (
    <img
      src={profileImage}
      alt="Profile"
      className="h-full w-full object-cover"
    />
  ) : (
    initials
  )}
</div>

                  <label
  htmlFor="profile-image-upload"
  className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-[#183f2a] text-white shadow-lg transition hover:scale-105 hover:bg-[#0f6b3d]"
  title="Change profile photo"
>
  <Camera size={14} />

  <input
    id="profile-image-upload"
    type="file"
    accept="image/png,image/jpeg,image/jpg,image/webp"
    onChange={handleProfileImage}
    className="hidden"
  />
</label>
{profileImage && (
  <button
    type="button"
    onClick={() => {
  setProfileImage("");

  setProfile((prev) => {
    const updatedProfile = {
      ...prev,
      profileImage: "",
    };

    setStorage("farmerProfile", updatedProfile);

    return updatedProfile;
  });
}}
    className="absolute -bottom-2 -left-2 flex h-8 w-8 items-center justify-center rounded-xl bg-red-500 text-white shadow-lg transition hover:scale-105 hover:bg-red-600"
    title="Remove profile photo"
  >
    ×
  </button>
)}
                </div>

                <div>
                  <p className="text-xs font-bold text-white/70">
                    Farmer account
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-white">
                    {profile.name || "Your Name"}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold text-white">
                      <ShieldCheck size={12} />
                      Verified profile
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold text-white">
                      <Leaf size={12} />
                      Smart Farmer
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/65">
                  Account status
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#b7f3c6]" />
                  <span className="text-sm font-black text-white">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main */}
        <form
          onSubmit={handleSave}
          className="grid gap-6 xl:grid-cols-[1fr_360px]"
        >
          <div className="space-y-6">

            {/* Personal Information */}
            <section className="sf-card p-5 sm:p-6">
              <div className="flex items-center gap-3 border-b border-[#edf1ed] pb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf7ee] text-[#18864b]">
                  <User size={18} />
                </div>

                <div>
                  <h2 className="font-black text-[#34473a]">
                    Personal Information
                  </h2>

                  <p className="text-xs text-[#8a958e]">
                    Basic information used across your account.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                <Field
                  label="Full name"
                  icon={User}
                  value={profile.name}
                  onChange={(value) =>
                    updateField("name", value)
                  }
                  placeholder="Enter your name"
                  required
                />

                <Field
                  label="Phone number"
                  icon={Phone}
                  value={profile.phone}
                  onChange={(value) =>
                    updateField("phone", value)
                  }
                  placeholder="Enter phone number"
                />

                <Field
                  label="Email address"
                  icon={Mail}
                  value={profile.email}
                  onChange={(value) =>
                    updateField("email", value)
                  }
                  placeholder="Enter email address"
                  type="email"
                />

                <Field
                  label="Preferred language"
                  icon={Globe2}
                  value={profile.language}
                  onChange={(value) =>
                    updateField(
                      "language",
                      value
                    )
                  }
                  select
                  options={[
                    "English",
                    "Telugu",
                    "Hindi",
                    "Tamil",
                    "Kannada",
                    "Malayalam",
                    "Marathi",
                    "Bengali",
                  ]}
                />

              </div>
            </section>

            {/* Farm Information */}
            <section className="sf-card p-5 sm:p-6">
              <div className="flex items-center gap-3 border-b border-[#edf1ed] pb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff6df] text-[#a17b20]">
                  <Sprout size={18} />
                </div>

                <div>
                  <h2 className="font-black text-[#34473a]">
                    Farm Information
                  </h2>

                  <p className="text-xs text-[#8a958e]">
                    Help Smart Farmer personalize recommendations.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                <Field
                  label="Village"
                  icon={MapPin}
                  value={profile.village}
                  onChange={(value) =>
                    updateField(
                      "village",
                      value
                    )
                  }
                  placeholder="Village name"
                />

                <Field
                  label="District"
                  icon={MapPin}
                  value={profile.district}
                  onChange={(value) =>
                    updateField(
                      "district",
                      value
                    )
                  }
                  placeholder="District"
                />

                <Field
                  label="State"
                  icon={MapPin}
                  value={profile.state}
                  onChange={(value) =>
                    updateField(
                      "state",
                      value
                    )
                  }
                  placeholder="State"
                />

                <Field
                  label="Pincode"
                  icon={MapPin}
                  value={profile.pincode}
                  onChange={(value) =>
                    updateField(
                      "pincode",
                      value
                    )
                  }
                  placeholder="Pincode"
                />

                <Field
                  label="Farm size"
                  icon={Sprout}
                  value={profile.farmSize}
                  onChange={(value) =>
                    updateField(
                      "farmSize",
                      value
                    )
                  }
                  placeholder="Example: 4.5 acres"
                />

                <Field
                  label="Farming experience"
                  icon={Sprout}
                  value={profile.experience}
                  onChange={(value) =>
                    updateField(
                      "experience",
                      value
                    )
                  }
                  placeholder="Example: 8 years"
                />

              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-bold text-[#536158]">
                  Main crops
                </label>

                <textarea
                  value={profile.crops}
                  onChange={(e) =>
                    updateField(
                      "crops",
                      e.target.value
                    )
                  }
                  placeholder="Example: Tomato, Onion, Chilli"
                  rows={3}
                  className="sf-input resize-none"
                />
              </div>
            </section>

            {/* Preferences */}
            <section className="sf-card p-5 sm:p-6">
              <div className="flex items-center gap-3 border-b border-[#edf1ed] pb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1edfa] text-[#7355a2]">
                  <Bell size={18} />
                </div>

                <div>
                  <h2 className="font-black text-[#34473a]">
                    Preferences
                  </h2>

                  <p className="text-xs text-[#8a958e]">
                    Control how Smart Farmer communicates with you.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2">

                <Preference
                  icon={Bell}
                  title="Smart notifications"
                  description="Receive market, booking and buyer alerts."
                  checked={profile.notifications}
                  onChange={(value) =>
                    updateField(
                      "notifications",
                      value
                    )
                  }
                />

                <Preference
                  icon={Mic}
                  title="Voice AI assistant"
                  description="Allow the AI assistant to use voice features."
                  checked={profile.voiceAssistant}
                  onChange={(value) =>
                    updateField(
                      "voiceAssistant",
                      value
                    )
                  }
                />

                <Preference
                  icon={Bell}
                  title="Market opportunity alerts"
                  description="Get alerts when important selling opportunities appear."
                  checked={profile.marketingAlerts}
                  onChange={(value) =>
                    updateField(
                      "marketingAlerts",
                      value
                    )
                  }
                />

              </div>
            </section>

            {/* Save */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              {saved && (
                <div className="flex items-center gap-2 text-xs font-bold text-[#18864b]">
                  <CheckCircle2 size={16} />
                  Profile saved successfully
                </div>
              )}

              <button
                type="submit"
                className="sf-button sf-button-primary px-6"
              >
                <Save size={16} />
                Save profile
              </button>
            </div>
          </div>

          {/* Right Panel */}
          <aside className="space-y-5">

            <div className="sf-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf7ee] text-[#18864b]">
                  <SparklesIcon />
                </div>

                <div>
                  <h3 className="font-black text-[#34473a]">
                    Smart Profile
                  </h3>

                  <p className="text-[11px] text-[#8a958e]">
                    Personalization strength
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#637068]">
                    Profile completion
                  </span>

                  <span className="font-black text-[#18864b]">
                    {calculateCompletion(profile)}%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e8eee8]">
                  <div
                    className="h-full rounded-full bg-[#18864b] transition-all"
                    style={{
                      width: `${calculateCompletion(
                        profile
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-[#7b887f]">
                Complete your farm details to get more relevant
                crop, market and storage recommendations.
              </p>
            </div>

            <div className="sf-card p-6">
              <p className="text-xs font-black uppercase tracking-wider text-[#8b988f]">
                Your Smart Farmer tools
              </p>

              <div className="mt-4 space-y-2">
                <ToolRow
                  icon={Sprout}
                  title="Crop management"
                  text="Track your crops"
                />

                <ToolRow
                  icon={TrendingUp}
                  title="Market intelligence"
                  text="Compare prices"
                />
                <ToolRow
  icon={TrendingUp}
  title="Market intelligence"
  text="Compare prices"
/>

                <ToolRow
                  icon={Warehouse}
                  title="Cold storage"
                  text="Find nearby storage"
                />

                <ToolRow
                  icon={Mic}
                  title="AI Assistant"
                  text="Ask by voice"
                />
              </div>
            </div>

            <div className="rounded-[24px] bg-[#173d29] p-6 text-white shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheck size={19} />
              </div>

              <h3 className="mt-4 font-black">
                Your data stays local
              </h3>

              <p className="mt-2 text-xs leading-5 text-white/65">
                This frontend demo stores your profile information
                in your browser's localStorage. No backend database
                is being used.
              </p>
            </div>

          </aside>
        </form>
      </div>
    </DashboardLayout>
  );
}

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  select = false,
  options = [],
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-[#536158]">
        {label}
        {required && (
          <span className="ml-1 text-[#d45c55]">
            *
          </span>
        )}
      </label>

      <div className="relative">
        <Icon
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#95a098]"
        />

        {select ? (
          <select
            value={value}
            onChange={(e) =>
              onChange(e.target.value)
            }
            className="sf-input appearance-none pl-10"
          >
            {options.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) =>
              onChange(e.target.value)
            }
            placeholder={placeholder}
            required={required}
            className="sf-input pl-10"
          />
        )}
      </div>
    </div>
  );
}

function Preference({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl p-3 transition hover:bg-[#f7faf6]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1f5f0] text-[#68766d]">
          <Icon size={16} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-black text-[#425047]">
            {title}
          </p>

          <p className="mt-0.5 text-[10px] leading-4 text-[#89958d]">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-[#18864b]"
            : "bg-[#cbd4cd]"
        }`}
        aria-label={`Toggle ${title}`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function ToolRow({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-[#f6f9f5]">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf7ee] text-[#18864b]">
        <Icon size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-[#44534a]">
          {title}
        </p>

        <p className="text-[10px] text-[#929d96]">
          {text}
        </p>
      </div>

      <ChevronRight
        size={14}
        className="text-[#a2aca5]"
      />
    </div>
  );
}

function calculateCompletion(profile) {
  const fields = [
    profile.name,
    profile.phone,
    profile.email,
    profile.village,
    profile.district,
    profile.pincode,
    profile.farmSize,
    profile.crops,
    profile.experience,
  ];

  const completed = fields.filter(
    Boolean
  ).length;

  return Math.round(
    (completed / fields.length) * 100
  );
}

function SparklesIcon() {
  return (
    <Sparkles
      size={18}
    />
  );
}

