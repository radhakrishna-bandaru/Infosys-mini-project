import DashboardLayout from "../../layouts/DashboardLayout";

export default function Placeholder({ title, description }) {
  return (
    <DashboardLayout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-3xl">
            🌱
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            {title}
          </h1>

          <p className="mt-2 text-gray-500">
            {description}
          </p>

          <p className="mt-5 text-sm font-medium text-green-700">
            Module ready for development.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}