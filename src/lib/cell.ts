export class Cell {
	public x: number;
	public y: number;

	public constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

    public get id(): string {
        return `${this.x},${this.y}`;
    }

	public equals(cell: Cell): boolean {
		return this.id === cell.id;
	}
}

export type State = Cell[];
