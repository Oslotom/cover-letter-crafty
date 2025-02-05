const Roadmap = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a242f] to-[#222f3a] py-8">
      <div className="container max-w-[950px] mx-auto p-8">
        <div className="text-center space-y-6 mb-8">
          <h1 className="text-4xl font-bold text-white">Product Roadmap</h1>
        </div>
        <div className="flex justify-center">
          <iframe 
            src="https://view.monday.com/embed/1804957598-b74c3a7d5fa42fae5b9b606f724ee5ea?r=euc1" 
            width="770" 
            height="500" 
            style={{ border: 0, boxShadow: '5px 5px 56px 0px rgba(0,0,0,0.25)' }}
            title="Product Roadmap"
          />
        </div>
      </div>
    </div>
  );
};

export default Roadmap;