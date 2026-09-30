# Pilates Enroll

Mobile-first PWA that enrolls you in pilates timeslots at a date/time you define in advance.

- Add an enrollment: class name, class time, and when to auto-enroll.
- At the enroll time the app calls `StudioConnector.enroll()` (`connector.js`) and shows status in-app.
- Data is stored on the device (localStorage). No backend.

## Run on your phone
Serve the folder over HTTPS (e.g. GitHub Pages) and use "Add to Home Screen". Locally: `python3 -m http.server 8000`.

## Limitation
A web app can only fire while it is open (or resumed). For truly unattended enrollment, a small server job is needed.

## TODO
Implement the real studio integration in `connector.js`.
