export default function MapContainer() {
  return (
    <div className="w-full h-full">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14902.5866164293!2d106.613901!3d20.8072865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314a7735d162afdb%3A0x70df39254ee1c357!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBI4bqjaSBQaMOYbmc!5e0!3m2!1svi!2svn!4v1711900000000!5m2!1svi!2svn"
        className="w-full h-full border-none"
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
