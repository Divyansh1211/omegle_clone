import { useSearchParams } from "react-router-dom";

export const Room = () => {
  const [searchParam, setSearchParam] = useSearchParams();
  const name = searchParam.get("name");
  return <div>ALO {name}</div>;
};
