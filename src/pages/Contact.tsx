const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a242f] to-[#222f3a] py-8">
      <div className="container max-w-[950px] mx-auto p-8">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-white">Contact</h1>
          <p className="text-xl text-gray-300">
            For inquiries, please contact:{" "}
            <a href="mailto:tomhaugeplass@gmail.com" className="text-blue-400 hover:text-blue-300">
              tomhaugeplass@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;