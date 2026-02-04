import PartItem from "./PartItem";

const PartList = ({ parts, selectedId, onSelect }) => {
  return (
    <div
      className="
      /* 1. 기본 위치 및 배경 */
      absolute left-6 top-24 z-20 
      flex flex-col gap-3 p-3 
      bg-white/40 backdrop-blur-md rounded-xl shadow-sm
      
      /* 2. 크기 제한 및 스크롤 활성화 */
      max-h-[65vh]           /* 화면의 65% 정도로 높이 제한 */
      overflow-y-scroll      /* 항상 스크롤 영역 확보 */
      overflow-x-hidden

      /* 3. 두 번째 사진 같은 커스텀 스크롤바 디자인 */
      /* 전체 막대(Track) 설정: 얇은 선 모양 */
      [&::-webkit-scrollbar]:w-[4px]             /* 아주 얇은 선 폭 */
      [&::-webkit-scrollbar-track]:bg-gray-300/30 /* 배경 선 색상 (연하게) */
      [&::-webkit-scrollbar-track]:rounded-full

      /* 움직이는 손잡이(Thumb) 설정 */
      [&::-webkit-scrollbar-thumb]:bg-gray-500    /* 손잡이 색상 (진하게) */
      [&::-webkit-scrollbar-thumb]:rounded-full   /* 동그란 막대기 모양 */
      
      /* 마우스 올렸을 때 손잡이 강조 */
      [&::-webkit-scrollbar-thumb:hover]:bg-gray-700
    "
    >
      {parts.map((part) => (
        <PartItem
          key={part.id}
          part={part}
          isSelected={selectedId === part.id}
          onClick={onSelect}
        />
      ))}
    </div>
  );
};

export default PartList;
