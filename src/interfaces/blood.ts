export interface BloodType {
	group: BloodGroup;
	rh: BloodRh;
}

export enum BloodGroup {
	A = "A",
	B = "B",
	AB = "AB",
	O = "O",
}

export enum BloodRh {
	POSITIVE = "+",
	NEGATIVE = "-",
}
