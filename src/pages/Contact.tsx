const Contact = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-[950px] mx-auto p-8">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-foreground">Contact</h1>
          <p className="text-xl text-muted-foreground">
            For inquiries, please contact:{" "}
            <a href="mailto:tomhaugeplass@gmail.com" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              tomhaugeplass@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;