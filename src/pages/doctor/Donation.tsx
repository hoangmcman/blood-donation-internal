"use client";

import React from "react";

import { DonationTable } from "@/components/donation-table";

export default function Donation() {
	const [viewOpen, setViewOpen] = React.useState(false);
	const [selectedId, setSelectedId] = React.useState("");

	return (
		<div className="p-6">
			<DonationTable onView={() => {}} onUpdate={() => {}} />
		</div>
	);
}
