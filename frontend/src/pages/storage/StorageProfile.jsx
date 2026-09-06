import { useEffect, useState } from "react";
import {
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Save,
  ShieldCheck,
  Camera,
} from "lucide-react";

import {
  getLoggedInUser,
  loginUser,
} from "../../utils/auth";

export default function StorageProfile() {
  const [user, setUser] = useState(null);
  const [saved, setSaved] = useState(false);
  const [profileImage, setProfileImage] = useState(() => {
  const saved = localStorage.getItem("storageProfile");

  if (!saved) return "";

  try {
    return JSON.parse(saved)?.profileImage || "";
  } catch {
    return "";
  }
});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    location: "",
  });

  useEffect(() => {
    const currentUser =
      getLoggedInUser("storage");

    if (currentUser) {
      setUser(currentUser);

      setForm({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        businessName:
          currentUser.businessName || "",
        location:
          currentUser.location || "",
      });
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

    const savedProfile =
      JSON.parse(
        localStorage.getItem("storageProfile") || "{}"
      );

    localStorage.setItem(
      "storageProfile",
      JSON.stringify({
        ...savedProfile,
        profileImage: image,
      })
    );
  };

  reader.readAsDataURL(file);
}

function deleteProfileImage() {
  setProfileImage("");

  const savedProfile =
    JSON.parse(
      localStorage.getItem("storageProfile") || "{}"
    );

  localStorage.setItem(
    "storageProfile",
    JSON.stringify({
      ...savedProfile,
      profileImage: "",
    })
  );
}
  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSaved(false);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const updatedUser = {
      ...user,
      ...form,
    };

    loginUser(
      "storage",
      updatedUser,
      localStorage.getItem(
        "smartFarmerToken"
      )
    );

    setUser(updatedUser);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  }

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="storage-profile-page space-y-6 pb-10">
      {/* HEADER */}
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f6b3d] via-[#18864b] to-[#42a96c] p-6 text-white shadow-[0_18px_45px_rgba(24,134,75,0.18)] sm:p-8">
  <div className="relative z-10">
    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
      <User size={14} />
      ACCOUNT MANAGEMENT
    </div>

    <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
      Storage Profile
    </h1>

    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px]">
      Manage your storage business, contact information and
      account details.
    </p>
  </div>

  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10" />
  <div className="pointer-events-none absolute -bottom-24 right-24 h-52 w-52 rounded-full bg-white/5" />
</div>
     {/* PROFILE HEADER */}
<div className="sf-card overflow-hidden">
  <div className="bg-gradient-to-br from-[#eef8f1] via-white to-[#f5faf5] p-6 sm:p-8">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="relative shrink-0">

  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-[#18864b] text-3xl font-black text-white shadow-lg">

    {profileImage ? (
      <img
        src={profileImage}
        alt="Storage profile"
        className="h-full w-full object-cover"
      />
    ) : (
      (form.name || form.businessName || "S")
        .charAt(0)
        .toUpperCase()
    )}

  </div>

  <label
    htmlFor="storage-profile-image"
    className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-[#17351f] text-white shadow-lg"
  >
    <Camera size={15} />
  </label>

  <input
    id="storage-profile-image"
    type="file"
    accept="image/*"
    onChange={handleProfileImage}
    className="hidden"
  />

  {profileImage && (
    <button
      type="button"
      onClick={deleteProfileImage}
      className="absolute -bottom-2 -left-2 flex h-8 w-8 items-center justify-center rounded-xl bg-red-500 text-white shadow-lg"
      title="Remove profile photo"
    >
      ×
    </button>
  )}

</div>

      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-[#18864b]">
          Storage Owner
        </p>

        <h2 className="mt-1 truncate text-2xl font-black text-[#17351f]">
          {form.businessName ||
            form.name ||
            "Storage Owner"}
        </h2>

        <p className="mt-1 text-sm text-[#7b8981]">
          {form.name || "Storage Owner"}
        </p>

        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#dceee1] bg-white px-3 py-1.5 text-xs font-bold text-[#18864b] shadow-sm">
          <ShieldCheck size={15} />
          Verified Account
        </div>
      </div>
    </div>
  </div>
</div>
     {/* FORM */}

<form
  onSubmit={handleSubmit}
  className="sf-card overflow-hidden"
>
  {/* BUSINESS INFORMATION HEADER */}
  <div className="border-b border-[#e8eee9] bg-[#f8fbf8] px-5 py-5 sm:px-7">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#18864b]">
        <Building2 size={21} />
      </div>

      <div className="min-w-0">
        <h2 className="text-lg font-bold text-[#16351f]">
          Business Information
        </h2>

        <p className="mt-1 text-sm text-[#7b8981]">
          Keep your storage business and contact details up to date.
        </p>
      </div>
    </div>
  </div>

  {/* FORM FIELDS */}
  <div className="p-5 sm:p-7">

    <div className="grid gap-5 md:grid-cols-2">

      {/* OWNER NAME */}
      <Field
        label="Owner Name"
        icon={<User size={17} />}
      >
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="sf-input w-full pl-10"
          placeholder="Enter owner name"
        />
      </Field>

      {/* BUSINESS NAME */}
      <Field
        label="Business Name"
        icon={<Building2 size={17} />}
      >
        <input
          type="text"
          name="businessName"
          value={form.businessName}
          onChange={handleChange}
          className="sf-input w-full pl-10"
          placeholder="Enter storage business name"
        />
      </Field>

      {/* EMAIL */}
      <Field
        label="Email Address"
        icon={<Mail size={17} />}
      >
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="sf-input w-full pl-10"
          placeholder="Enter email address"
        />
      </Field>

      {/* PHONE */}
      <Field
        label="Phone Number"
        icon={<Phone size={17} />}
      >
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="sf-input w-full pl-10"
          placeholder="Enter phone number"
        />
      </Field>

      {/* LOCATION */}
      <div className="md:col-span-2">
        <Field
          label="Storage Location"
          icon={<MapPin size={17} />}
        >
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="sf-input w-full pl-10"
            placeholder="Enter storage location"
          />
        </Field>
      </div>
    </div>

    {/* INFORMATION + SAVE */}
    <div className="mt-7 flex flex-col gap-4 border-t border-[#e8eee9] pt-6 sm:flex-row sm:items-center sm:justify-between">

      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ec] text-[#18864b]">
          <ShieldCheck size={17} />
        </div>

        <div>
          <p className="text-sm font-semibold text-[#263b2d]">
            Keep your information accurate
          </p>

          <p className="mt-0.5 text-xs text-[#8a978f]">
            Farmers and partners use these details to contact you.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:items-end">
        {saved && (
          <p className="text-sm font-semibold text-[#18864b]">
            ✓ Profile updated successfully
          </p>
        )}

        <button
          type="submit"
          className="sf-button sf-button-primary inline-flex items-center justify-center gap-2 px-6"
        >
          <Save size={17} />
          Save Changes
        </button>
      </div>
    </div>
  </div>
</form>
    {/* ACCOUNT INFO */}

<div className="sf-card overflow-hidden">
  <div className="border-b border-[#e8eee9] bg-[#f8fbf8] px-5 py-5 sm:px-7">
    <h2 className="text-lg font-bold text-[#16351f]">
      Account Information
    </h2>

    <p className="mt-1 text-sm text-[#7b8981]">
      Overview of your Smart Farmer account.
    </p>
  </div>

  <div className="p-5 sm:p-7">
    <div className="grid gap-4 sm:grid-cols-2">
      <Info
        label="Role"
        value="Storage Owner"
      />

      <Info
        label="Account ID"
        value={
          user.id ||
          user._id ||
          "Not available"
        }
      />

      <Info
        label="Account Status"
        value="Active"
      />

      <Info
        label="Authentication"
        value="Secure server login"
      />
    </div>
  </div>
</div>
    </div>
  );
}

// ==================== COMPONENTS ====================

function Field({
  label,
  icon,
  children,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </span>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>

        {children}
      </div>
    </label>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-[#f8faf7] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-[#17351f]">
        {value}
      </p>
    </div>
  );
}