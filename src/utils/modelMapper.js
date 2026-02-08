import { getAssemblyModelSignedUrl } from "../api/modelAPI";

// Machine Vice 파일명 매핑 (개별 부품만)
const MACHINE_VICE_FILE_MAP = {
  part_1_fuhrung: "Part1 Fuhrung.glb",
  part_2_feste_backe: "Part2 Feste Backe.glb",
  part_3_lose_backe: "Part3-lose backe.glb",
  part_4_spindelsockel: "Part4 spindelsockel.glb",
  part_5_spannbacke: "Part5-Spannbacke.glb",
  part_6_fuhrungschiene: "Part6-fuhrungschiene.glb",
  part_7_trapez_spindel: "Part7-TrapezSpindel.glb",
  part_8_grundplatte: "Part8-grundplatte.glb",
};

// Drone 파일명 매핑 (개별 부품만)
const DRONE_FILE_MAP = {
  arm_gear: "Arm gear.glb",
  beater_disc: "Beater disc.glb",
  gearing: "Gearing.glb",
  impellar_blade: "Impellar Blade.glb",
  leg: "Leg.glb",
  main_frame: "Main frame.glb",
  main_frame_mir: "Main frame_MIR.glb",
  nut: "Nut.glb",
  screw: "Screw.glb",
  xyz: "xyz.glb",
};

// Suspension 파일명 매핑
const SUSPENSION_FILE_MAP = {
  base: "BASE.glb",
  nit: "NIT.glb",
  nut: "NUT.glb",
  rod: "ROD.glb",
  spring: "SPRING.glb",
};

// V4 Engine 파일 매핑 추가
const V4_ENGINE_FILE_MAP = {
  connecting_rod_cap: "Connecting Rod Cap.glb",
  connecting_rod: "Connecting Rod.glb",
  conrod_bolt: "Conrod Bolt.glb",
  crankshaft: "Crankshaft.glb",
  piston_pin: "Piston Pin.glb",
  piston_ring: "Piston Ring.glb",
  piston: "Piston.glb",
};

// FILE_MAP_BY_MODEL 업데이트
export const FILE_MAP_BY_MODEL = {
  Drone: DRONE_FILE_MAP,
  Suspension: SUSPENSION_FILE_MAP,
  "Machine Vice": MACHINE_VICE_FILE_MAP,
  "V4 Engine": V4_ENGINE_FILE_MAP,
};

/**
 * API의 parts 데이터를 UI용 형태로 변환
 * @param {Object} apiData - API에서 받은 모델 데이터
 * @returns {Promise<Array>} - 변환된 부품 배열 (완성본 포함)
 */
export const mapModelData = async (apiData) => {
  const { name, parts, assemblyModelUrl } = apiData;

  const folderName = name.replace(/\s+/g, "");
  const fileMap = FILE_MAP_BY_MODEL[name];

  const result = [];

  // modelMapper.js 수정 부분

  // 1. 완성본 추가
  if (assemblyModelUrl) {
    // 만약 assemblyModelUrl이 이미 'http'로 시작하는 완성된 주소라면
    // API를 거치지 않고 바로 사용하거나, URL이 중복되지 않도록 방어 코드를 짭니다.

    if (assemblyModelUrl.startsWith("http")) {
      // 이미 URL인 경우 그대로 사용
      result.push({
        id: "assembly",
        name: "전체 조립품",
        description: "모든 부품이 조립된 완성 모델입니다.",
        model: assemblyModelUrl, // 👈 여기서 직접 할당
        meshName: "assembly",
        isAssembly: true,
      });
    } else {
      // URL이 아니라 파일 경로만 왔을 때만 기존처럼 요청
      try {
        const signedUrl = await getAssemblyModelSignedUrl(assemblyModelUrl);
        if (signedUrl) {
          result.push({
            id: "assembly",
            name: "전체 조립품",
            description: "모든 부품이 조립된 완성 모델입니다.",
            model: signedUrl,
            meshName: "assembly",
            isAssembly: true,
          });
        }
      } catch (error) {
        console.error("완성본 URL 가져오기 실패:", error);
      }
    }
  }

  // 2. 개별 부품 추가 (로컬 파일)
  if (!fileMap) {
    if (parts && parts.length > 0) {
      parts.forEach((part, index) => {
        result.push({
          id: `part_${index + 1}`,
          name: part.name,
          description: part.description,
          model: null,
          meshName: part.meshName,
          partImageUrl: part.partImageUrl,
          isAssembly: false,
        });
      });
    }

    return result;
  }

  if (parts && parts.length > 0) {
    parts.forEach((part, index) => {
      const fileName = fileMap[part.meshName];

      if (!fileName) {
        console.warn(`파일명 매핑 없음: ${part.meshName} (${name})`);
      }

      const encodedPath = fileName
        ? `/models/${folderName}/${encodeURIComponent(fileName)}`
        : null;

      result.push({
        id: `part_${index + 1}`,
        name: part.name,
        description: part.description,
        model: encodedPath,
        meshName: part.meshName,
        partImageUrl: part.partImageUrl,
        isAssembly: false,
      });
    });
  }

  return result;
};

/**
 * 특정 모델에 새로운 파일 매핑 추가
 * @param {string} modelName - 모델 이름
 * @param {Object} fileMap - meshName: fileName 객체
 */
export const addFileMapping = (modelName, fileMap) => {
  FILE_MAP_BY_MODEL[modelName] = fileMap;
};
