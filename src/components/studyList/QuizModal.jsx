import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const QuizModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const models = [
    { id: "Drone", name: "드론", icon: "🚁" },
    { id: "RobotArm", name: "로봇 팔", icon: "🦾" },
    { id: "RobotGripper", name: "로봇 그리퍼", icon: "🤖" },
    { id: "LeafSpring", name: "판 스프링", icon: "🔧" },
    { id: "Suspension", name: "서스펜션", icon: "⚙️" },
    { id: "MachineVice", name: "머신 바이스", icon: "🔩" },
    { id: "V4Engine", name: "V4 엔진", icon: "🏎️" },
  ];

  const difficulties = [
    {
      id: "Normal",
      name: "일반",
      description: "기본 개념 위주",
      color: "bg-acc-blue-light/15 border-acc-blue text-acc-blue",
    },
    {
      id: "Hard",
      name: "어려움",
      description: "심화 학습 문제",
      color: "bg-acc-red-light/15 border-acc-red text-acc-red",
    },
  ];

  const handleModelSelect = (model) => {
    setSelectedModel(model.id);
    setIsDropdownOpen(false);
  };

  const handleStart = () => {
    if (selectedModel && selectedDifficulty) {
      navigate(`/quiz?model=${selectedModel}&difficulty=${selectedDifficulty}`);
      onClose();
    }
  };

  const selectedModelData = models.find((m) => m.id === selectedModel);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-bg-1/60 bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-[700px] max-h-[85vh] overflow-y-auto p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="t-24-semi">퀴즈 시작하기</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* 모델 선택 - 드롭다운 */}
        <div className="mb-8 mt-10">
          <h3 className="t-18-semi mb-4">학습할 모델 선택</h3>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all text-left flex items-center justify-between bg-white"
            >
              {selectedModelData ? (
                <div className="flex items-center gap-3">
                  <span className="text-xl">{selectedModelData.icon}</span>
                  <span className="t-16-b-16-med">
                    {selectedModelData.name}
                  </span>
                </div>
              ) : (
                <span className="text-gray-400 b-16-med">
                  모델을 선택하세요
                </span>
              )}
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* 드롭다운 메뉴 */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-[300px] overflow-y-auto z-10">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className={`w-full p-4 text-left flex items-center gap-3 hover:bg-gray-50 transition-all border-b border-gray-100 last:border-b-0 ${
                      selectedModel === model.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <span className="text-3xl">{model.icon}</span>
                    <span className="b-16-med">{model.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 난이도 선택 */}
        <div className="mb-20 mt-20">
          <h3 className="t-18-semi mb-4">난이도 선택</h3>
          <div className="grid grid-cols-2 gap-4">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty.id}
                onClick={() => setSelectedDifficulty(difficulty.id)}
                className={`p-5 rounded-xl border-2 transition-all text-left ${
                  selectedDifficulty === difficulty.id
                    ? difficulty.color
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="b-16-semi mb-1">{difficulty.name}</div>
                <div className="b-14-reg-160 text-gray-600">
                  {difficulty.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={handleStart}
          disabled={!selectedModel || !selectedDifficulty}
          className={`w-full py-4 rounded-xl t-16-semi transition-all ${
            selectedModel && selectedDifficulty
              ? "bg-blue-100 text-white hover:bg-acc-blue active:scale-98"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          퀴즈 시작하기
        </button>
      </div>
    </div>
  );
};

export default QuizModal;
