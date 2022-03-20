import React, { useState } from 'react';
import './Notification.css';

const Notification = ({_message}) => {
	const [message, setMessage] = useState(_message)
	return (
		<div className="notification-wrapper">
			<div className="notification-body">
				<p>{message}</p>
			</div>
		</div>
	)
}

export default Notification;