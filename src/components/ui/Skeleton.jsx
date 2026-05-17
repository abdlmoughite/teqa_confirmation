import { clsx } from "clsx";

const Skeleton = ({ className, count = 1, ...props }) => {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, index) => (
        <span key={index} className={clsx("teqa-skeleton", className)} {...props} />
      ))}
    </>
  );
};

export default Skeleton;
