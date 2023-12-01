console.log("Connected!!!");

const segmentData = [
  {
    startDuration: 0,
    endDuration: 30,
    description: "What is a 0-1 cohort?",
  },
  {
    startDuration: 31,
    endDuration: 60,
    description: "What is a 1-100 cohort?",
  },
  {
    startDuration: 61,
    endDuration: 130,
    description: "About your Tutor",
  },
  {
    startDuration: 131,
    endDuration: 180,
    description: "Price & Discount Information",
  },
  {
    startDuration: 181,
    endDuration: 210,
    description: "Is is right for your or not?",
  },
];

var player = videojs(
  "my-video",
  {
    controls: true,
    fluid: true,
    html5: {
      vhs: {
        overrideNative: true,
      },
    },
  },
  function () {
    var player = this;
    player.eme();
    player.src({
      src: "https://cdn.bitmovin.com/content/assets/art-of-motion_drm/mpds/11331.mpd",
      type: "application/dash+xml",
      keySystems: {
        "com.widevine.alpha": "https://cwip-shaka-proxy.appspot.com/no_auth",
      },
    });

    player.ready(function () {
      const progressControl = player.controlBar.progressControl;
      const seekBar = progressControl.seekBar;

      player.tech(true).on("keystatuschange", function (event) {
        console.log("event: ", event);
      });

      const toolTip = document.createElement("span");
      toolTip.className = "custom-tooltip";
      toolTip.innerText = "Testing description";
      seekBar?.el()?.appendChild(toolTip);

      progressControl?.on("mousemove", function (event) {
        const progressBarRect = progressControl.el().getBoundingClientRect();
        const toolTipRect = toolTip.getBoundingClientRect();

        const position = event.clientX - progressBarRect.left - 10; // 10 for margin
        const hoverTime = Math.floor(
          (position / (progressControl.width() - 20)) * player.duration()
        );
        const percTravel = position / (progressControl.width() - 20); // 20 for both side 10 margin
        const currentSegment = segmentData.find(function (segment) {
          return (
            hoverTime >= segment.startDuration &&
            hoverTime <= segment.endDuration
          );
        });
        if (currentSegment) {
          toolTip.style.display = "block";
          toolTip.style.left = `${position - toolTipRect.width * percTravel}px`; // 10 because we have  for margin left and right
          toolTip.innerText = currentSegment?.description;
        } else {
          toolTip.style.display = "none";
        }
      });

      progressControl.on("mouseleave", function (event) {
        toolTip.style.display = "none";
      });

      player.on("durationchange", function () {
        const videoDuration = player.duration();
        if (videoDuration > 0) {
          segmentData.forEach((seg) => {
            if (seg.startDuration == 0) return;
            const ele = document.createElement("span");
            ele.className = "custom-divider";
            const position = (seg.startDuration / videoDuration) * 100;
            ele.style.left = `${position}%`;
            const seekBarEle = seekBar.el();
            seekBarEle.appendChild(ele);
          });
        }
      });
    });
  }
);

function scrollToSegment(segment) {
  player.currentTime(segment?.startDuration || 0);
}

const accordionContainer = document.getElementById("segmentAccordion");

segmentData.forEach(function (segment, index) {
  // Create accordion item
  var accordionItem = document.createElement("a");
  accordionItem.href = "#";
  accordionItem.className = "segment-link";
  accordionItem.addEventListener("click", function (e) {
    e.preventDefault();
    scrollToSegment(segment);
  });
  accordionItem.innerHTML = `${formatTime(segment.startDuration)} ${
    segment.description
  }`;

  accordionContainer.appendChild(accordionItem);
  accordionContainer.appendChild(document.createElement("br"));
});

// To format time string from number of second
function formatTime(seconds) {
  if (typeof seconds !== "number" || seconds < 0) {
    // Check if the input is valid
    return "Invalid input";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let formattedTime = "";

  if (hours > 0) {
    formattedTime += hours + " : ";
  }

  formattedTime += (minutes < 10 ? "0" : "") + minutes + " : ";
  formattedTime += (remainingSeconds < 10 ? "0" : "") + remainingSeconds;

  return formattedTime.trim();
}

// In case where we need to restrict no of char in string
function truncateString(str, maxLength) {
  if (
    typeof str !== "string" ||
    typeof maxLength !== "number" ||
    maxLength < 0
  ) {
    return "Invalid input";
  }
  if (str.length <= maxLength) {
    return str;
  } else {
    return str.substring(0, maxLength) + "...";
  }
}
