export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to TheShe Unit
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your modern ecommerce platform is ready!
        </p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">🎉 Setup Complete!</h2>
          <p className="text-gray-600">
            Your frontend is now connected to the backend at{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              http://localhost:8080/api/v1
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
