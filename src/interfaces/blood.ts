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

export enum BloodComponentType {
	PLASMA = "plasma",
	PLATELETS = "platelets",
	RED_CELLS = "red_cells",
	WHOLE_BLOOD = "whole_blood",
}
