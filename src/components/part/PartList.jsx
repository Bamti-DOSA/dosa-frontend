import PartItem from "./PartItem";

const PartList = ({ parts, selectedId, onSelect }) => {
  return (
    <div
      style={{
        width: "97px",
        /* 1. 핵심: 화면 중앙 정렬 */
        position: "absolute",
        left: "53px",
        top: "50%", // 화면 높이의 절반 지점에서 시작
        transform: "translateY(-50%)", // 리스트 자신의 높이 절반만큼 위로 올려서 완벽한 중앙 정렬

        /* 2. 높이: 화면 위아래에 최소 40px씩은 여유를 줌 */
        maxHeight: "calc(100vh - 80px)",

        display: "flex",
        flexDirection: "column",
        gap: "8.24px",
        opacity: 1,
      }}
      className="
    overflow-y-auto
    overflow-x-hidden
    z-20
    pr-2

    /* 스크롤바 디자인 (사진 5번의 얇은 느낌 반영) */
    [&::-webkit-scrollbar]:w-[3px]
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-gray-400/50
    [&::-webkit-scrollbar-thumb]:rounded-full
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
