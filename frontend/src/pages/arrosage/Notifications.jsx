// src/components/Notifications.jsx
import React from "react";
import { MDBListGroup, MDBListGroupItem } from "mdb-react-ui-kit";

const Notifications = ({ items }) => (
  <MDBListGroup flush className="my-4">
    {items.map((notif, index) => (
      <MDBListGroupItem key={index}>🔔 {notif}</MDBListGroupItem>
    ))}
  </MDBListGroup>
);

export default Notifications;
