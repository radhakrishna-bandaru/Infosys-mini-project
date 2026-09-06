import { useEffect, useState } from "react";
import {
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Save,
  ShieldCheck,
  BriefcaseBusiness,
  CircleCheck,
  Camera,
} from "lucide-react";

import {
  getLoggedInUser,
  loginUser,
} from "../../utils/auth";

export default function BuyerProfile() {
  const [user, setUser] = useState(null);
  const [saved, setSaved] = useState(false);
  const [profileImage, setProfileImage] = useState(() => {
  const saved = localStorage.getItem("buyerProfile");

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
    const currentUser = getLoggedInUser("buyer");

    if (currentUser) {
      setUser(currentUser);

      setForm({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        businessName: currentUser.businessName || "",
        location: currentUser.location || "",
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
        localStorage.getItem("buyerProfile") || "{}"
      );

    localStorage.setItem(
      "buyerProfile",
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
      localStorage.getItem("buyerProfile") || "{}"
    );

  localStorage.setItem(
    "buyerProfile",
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
      "buyer",
      updatedUser,
      localStorage.getItem("smartFarmerToken")
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

  const displayName =
    form.businessName ||
    form.name ||
    "Buyer";

  const initial =
    displayName.charAt(0).toUpperCase() || "B";

  return (
    <div className="buyer-profile-page space-y-6 pb-10">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          
          <h1 className="mt-1 text-2xl font-bold text-[#17351f] sm:text-3xl">
            Buyer Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your business and contact information.
          </p>
        </div>

        {saved && (
          <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#eef8f0] px-4 py-2 text-sm font-bold text-[#18864b]">
            <CircleCheck size={17} />
            Changes Saved
          </div>
        )}
      </div>

      {/* =================================================
          PROFILE SUMMARY
      ================================================= */}

      <section className="sf-card overflow-hidden">

        <div className="relative bg-gradient-to-br from-[#e8f5ec] via-[#f3faf4] to-white px-6 py-7 sm:px-8 sm:py-8">

          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[#dcefe1]" />

          <div className="absolute -bottom-20 right-32 h-36 w-36 rounded-full bg-[#edf7ef]" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">

            {/* AVATAR */}

          <div className="relative shrink-0">

  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-[#18864b] text-3xl font-black text-white shadow-[0_12px_25px_rgba(24,134,75,0.20)]">

    {profileImage ? (
      <img
        src={profileImage}
        alt="Buyer profile"
        className="h-full w-full object-cover"
      />
    ) : (
      initial
    )}

  </div>

  {/* CHANGE PHOTO */}

  <label
    htmlFor="buyer-profile-image"
    className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-[#17351f] text-white shadow-lg transition hover:scale-105"
    title="Change profile photo"
  >
    <Camera size={15} />
  </label>

  <input
    id="buyer-profile-image"
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
      className="absolute -bottom-2 -left-2 flex h-8 w-8 items-center justify-center rounded-xl bg-red-500 text-white shadow-lg transition hover:scale-105 hover:bg-red-600"
      title="Remove profile photo"
    >
      ×
    </button>
  )}

</div>

            {/* USER INFO */}

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-3">

                <h2 className="text-2xl font-black text-[#17351f]">
                  {displayName}
                </h2>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#18864b] shadow-sm">
                  <ShieldCheck size={14} />
                  Verified Account
                </span>

              </div>

              <p className="mt-1 text-sm font-medium text-[#718078]">
                {form.name || "Buyer"}
              </p>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#718078]">

                {form.email && (
                  <span className="inline-flex items-center gap-2">
                    <Mail
                      size={15}
                      className="text-[#18864b]"
                    />
                    {form.email}
                  </span>
                )}

                {form.phone && (
                  <span className="inline-flex items-center gap-2">
                    <Phone
                      size={15}
                      className="text-[#18864b]"
                    />
                    {form.phone}
                  </span>
                )}

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =================================================
          BUSINESS INFORMATION
      ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="sf-card overflow-hidden"
      >

        <div className="border-b border-[#edf1ed] px-5 py-5 sm:px-7">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ec] text-[#18864b]">
              <BriefcaseBusiness size={19} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#17351f]">
                Business Information
              </h2>

              <p className="mt-0.5 text-sm text-gray-500">
                Keep your buyer information up to date.
              </p>
            </div>

          </div>

        </div>

        <div className="p-5 sm:p-7">

          <div className="grid gap-5 md:grid-cols-2">

            {/* CONTACT NAME */}

            <Field
              label="Contact Name"
              icon={<User size={17} />}
            >
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="sf-input w-full pl-10"
                placeholder="Enter contact name"
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
                placeholder="Enter business name"
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
                label="Business Location"
                icon={<MapPin size={17} />}
              >
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="sf-input w-full pl-10"
                  placeholder="Enter business location"
                />
              </Field>

            </div>

          </div>

          {/* SAVE */}

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#edf1ed] pt-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="text-sm text-gray-400">
              Your profile information is stored securely.
            </div>

            <button
              type="submit"
              className="sf-button sf-button-primary inline-flex items-center justify-center gap-2"
            >
              <Save size={17} />
              Save Changes
            </button>

          </div>

        </div>

      </form>

      {/* =================================================
          ACCOUNT INFORMATION
      ================================================= */}

      <section className="sf-card overflow-hidden">

        <div className="border-b border-[#edf1ed] px-5 py-5 sm:px-7">

          <h2 className="text-lg font-bold text-[#17351f]">
            Account Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Basic details about your Smart Farmer account.
          </p>

        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">

          <Info
            label="Account Role"
            value="Buyer"
          />

          <Info
            label="Account Status"
            value="Active"
            success
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
            label="Authentication"
            value="Secure server login"
          />

        </div>

      </section>

    </div>
  );
}


/* =====================================================
   FIELD
===================================================== */

function Field({
  label,
  icon,
  children,
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-bold text-[#34443a]">
        {label}
      </span>

      <div className="relative">

        <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        {children}

      </div>

    </label>
  );
}


/* =====================================================
   INFO
===================================================== */

function Info({
  label,
  value,
  success = false,
}) {
  return (
    <div className="rounded-2xl border border-[#e8eee8] bg-[#f8faf7] p-4">

      <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a978f]">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">

        {success && (
          <span className="h-2 w-2 rounded-full bg-[#18864b]" />
        )}

        <p className="min-w-0 break-words text-sm font-bold text-[#17351f]">
          {value}
        </p>

      </div>

    </div>
  );
}