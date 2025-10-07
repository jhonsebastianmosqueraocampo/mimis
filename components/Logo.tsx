import AvatarCard from "./AvatarCard";

export default function Logo() {
  return (
    <AvatarCard
      name="MIMIS"
      imageUrl="https://picsum.photos/700/400?random"
      typographyProps={{
        style: {
          backgroundColor: "#1DB954",
          color: "#fff",
          fontFamily: "BubbleSans",
          fontSize: 20, // equivalente a "h5"
          fontWeight: "600",
          textAlign: "center",
          width: "100%",
          paddingVertical: 4, // opcional para que el fondo se vea mejor
        },
      }}
    />
  );
}
