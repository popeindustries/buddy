var profile = React.createElement(
  "div",
  null,
  React.createElement("img", { src: "avatar.png", class: "profile" }),
  React.createElement(
    "h3",
    null,
    [user.firstName, user.lastName].join(' ')
  )
);