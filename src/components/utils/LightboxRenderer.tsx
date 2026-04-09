import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

type LightboxSlide = {
  src: string;
};

type LightboxRendererProps = {
  close: () => void;
  index: number;
  open: boolean;
  slides: LightboxSlide[];
};

function LightboxRenderer({
  close,
  index,
  open,
  slides,
}: LightboxRendererProps) {
  return (
    <Lightbox
      close={close}
      index={index}
      open={open}
      slides={slides}
    />
  );
}

export default LightboxRenderer;
