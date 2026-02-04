import React from "react";

const PartDetail = ({ selectedPart }) => {
  if (!selectedPart) return null;

  return (
    <div className="absolute bottom-6 left-6 right-[35%] z-20 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 pointer-events-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {selectedPart.name}
      </h2>
      <div className="space-y-2 text-gray-600">
        <p>
          <span className="font-semibold text-gray-400">용도</span> &nbsp;&nbsp;{" "}
          {selectedPart.usage}
        </p>
        <p>
          <span className="font-semibold text-gray-400">설명</span> &nbsp;&nbsp;{" "}
          {selectedPart.description}
        </p>
      </div>
    </div>
  );
};

export default PartDetail;
