const SideBar = () => {
  return (
    <div className="bg-[#F6F8F9] flex flex-col p-[20px] w-[275px] min-h-screen border-r border-[#EEEEEE] shrink-0">
      {/* 로고 영역 */}
      <div className="flex items-center gap-3 mb-[49px] px-[8px]">
        <div className="w-[32px] h-[32px] bg-[#D9D9D9] rounded-[4px]" />
        <div className="text-[20px] font-bold tracking-tight text-black">
          SIMVEX
        </div>
      </div>

      {/* 메뉴 리스트 영역 */}
      <nav className="flex flex-col gap-[32px] w-full">
        {/* 학습 섹션 */}
        <div className="w-full items-start">
          <div className="text-[#00000066] text-[12px] mb-[18px]">학습</div>
          <div className="flex flex-col gap-[4px] w-full text-[18px] font-medium">
            <div className="bg-[#EBEBEB] text-black font-bold rounded-[8px] p-[10px] w-full cursor-pointer">
              진행 중인 학습
            </div>
            <div className="text-[#666666] hover:bg-[#E2E3E7] hover:text-black rounded-[8px] w-full p-[10px] cursor-pointer transition-colors">
              북마크
            </div>
          </div>
        </div>

        {/* 기록 섹션 */}
        <div className="w-full items-start">
          <div className="text-[#00000066] text-[12px] mb-[18px]">기록</div>

          <div className="flex flex-col gap-[4px] w-full text-[18px] font-medium text-[#666666]">
            {["메모 리스트", "AI 대화 내역", "퀴즈 기록", "PDF 출력"].map(
              (item) => (
                <div
                  key={item}
                  className="hover:bg-[#E2E3E7] hover:text-black rounded-[8px] w-full p-[10px] cursor-pointer transition-colors"
                >
                  {item}
                </div>
              ),
            )}
          </div>
        </div>

        {/* 추가 학습 섹션 */}
        <div className="w-full items-start">
          <div className="text-[#00000066] text-[12px] mb-[18px]">
            추가 학습
          </div>

          <div className="flex flex-col gap-[4px] w-full text-[18px] font-medium text-[#666666]">
            {["퀴즈", "워크 플로우"].map((item) => (
              <div
                key={item}
                className="hover:bg-[#E2E3E7] hover:text-black rounded-[8px] w-full p-[10px] cursor-pointer transition-colors"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default SideBar;
