from pathlib import Path

from PIL import Image


SPLASH_DIR = Path(__file__).resolve().parents[1] / "static" / "splash"
BLACK = (0, 0, 0, 255)
TRANSPARENT = (0, 0, 0, 0)


def make_ninepatch(source: Path) -> None:
    image = Image.open(source).convert("RGBA")
    width, height = image.size
    output = Image.new("RGBA", (width + 2, height + 2), TRANSPARENT)
    output.paste(image, (1, 1))

    # Stretch only the outermost background columns/rows, mirrored on both
    # sides so Android size differences do not push the centered brand mark.
    output.putpixel((1, 0), BLACK)
    output.putpixel((width, 0), BLACK)
    output.putpixel((0, 1), BLACK)
    output.putpixel((0, height), BLACK)

    # Allow the full image body to be used as content. This avoids Android
    # deriving asymmetric padding from the decorative center composition.
    for x in range(1, width + 1):
        output.putpixel((x, height + 1), BLACK)
    for y in range(1, height + 1):
        output.putpixel((width + 1, y), BLACK)

    output.save(source.with_name(f"{source.stem}.9.png"))


def main() -> None:
    for source in sorted(SPLASH_DIR.glob("splash-*.png")):
        if source.name.endswith(".9.png"):
            continue
        make_ninepatch(source)


if __name__ == "__main__":
    main()
