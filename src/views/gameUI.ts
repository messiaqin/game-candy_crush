class gameUI extends layer.ui.Sprite {
	private mesh: Mesh;
	public readonly cellColPadding: number = 7.5;
	public readonly cellRowPadding: number = 5;
	private cellWidth:number;
	private cellHeight:number;

	constructor(mesh: Mesh) {
		super();
		this.mesh = mesh;

		this.mesh.createMesh();
	}

	public onAddedToStage(e: egret.Event): void
	{
		this.width = this.parent.width;
		this.height = this.parent.height;
		this.cellWidth = (this.width - this.cellColPadding * this.mesh.cols * 2) / this.mesh.cols;
		this.cellHeight = (this.height - this.cellRowPadding * this.mesh.rows * 2) / this.mesh.rows;

		this.renderMesh();
	}

	public onRemovedFromStage(e: egret.Event): void
	{

	}

	public removeAllEventListeners(): void
	{

	}

	public getCellRectangle(rowOrIndex: number, col?: number) : egret.Rectangle
	{
		let position: egret.Point = this.getCellPoint(rowOrIndex, col);
		return new egret.Rectangle(
			position.x,
			position.y,
			this.cellWidth,
			this.cellHeight
		);
	}

	public getCellPoint(rowOrIndex: number, col?: number) : egret.Point
	{
		let row: number = rowOrIndex;
		if (col == null)
		{
			row = this.mesh.row(rowOrIndex);
			col = this.mesh.col(rowOrIndex);
		}
		// 列永远为正
		col = Math.abs(col);
		return new egret.Point(
			this.cellColPadding * col * 2 + this.cellWidth * col + this.cellColPadding, 
			this.cellRowPadding * row * 2 + this.cellHeight * row + this.cellRowPadding,
		);
	}

	public renderMesh() : void
	{
		this.removeChildren();

		for(let row of this.mesh.rowsEntries()) {
			for(let col of this.mesh.colsEntries()) {
				let cell: CellUI = new CellUI(this.mesh.cell(row, col));
				let rect = this.getCellRectangle(row, col);
				cell.x = rect.x;
				cell.y = rect.y;
				cell.width = rect.width;
				cell.height = rect.height;
				this.addChild(cell);
			}
		}
	}

	public renderSwap(fromCell: Cell, toCell:Cell, swapBack:boolean) : Promise<any>
	{
		let fromCellUI: CellUI = this.getChildByCellIndex(fromCell.index) as CellUI;
		let toCellUI: CellUI = this.getChildByCellIndex(toCell.index) as CellUI;
		console.log('swap: ', fromCell.index, toCell.index);

		let promises : Promise<any>[] = [];
		if (swapBack)
		{
			promises.push(fromCellUI.moveTo(200, this.getCellPoint(toCell.index), this.getCellPoint(fromCell.index)));
			promises.push(toCellUI.moveTo(200, this.getCellPoint(fromCell.index), this.getCellPoint(toCell.index)));
		} else {
			promises.push(fromCellUI.moveTo(200, this.getCellPoint(fromCell.index)));
			promises.push(toCellUI.moveTo(200, this.getCellPoint(toCell.index)));
		}
		return Promise.all(promises);
	}

	public renderCross(index: number) {
		let crossUI = new CrossUI(this.getCellRectangle(index));
		this.addChild(crossUI);
		return crossUI.fadeOut(400); //十字架时间长一点
	}

	public renderCrush(crushedCells: CrushedCells) : Promise<any>
	{
		let promises : Promise<any>[] = [];
		//十字消
		for(let group of crushedCells.crosses)
		{
			//移除十字架所有cells
			this.mesh.crossIndices(group.cellIndex).forEach(index => {
				let cellUI: CellUI = this.getChildByCellIndex(index) as CellUI;
				if (cellUI) cellUI.destroy();
			});
			promises.push(this.renderCross(group.cellIndex));
		}
		//移除其它cells
		for(let group of crushedCells.crushes)
		{
			group.cellIndices.forEach(index => {
				let cellUI: CellUI = this.getChildByCellIndex(index) as CellUI;
				if (cellUI) promises.push(cellUI.fadeOut(300).then(() => {
					cellUI.destroy(); 
				})); //消失且移除
			});
		}
		return Promise.all(promises);
	}

	public renderFill(filledCells:FilledCells) : Promise<any> {
		let promises: Promise<any>[] = [];
		for(let group of filledCells.fills)
		{
			if (group.fromIndex >= 0) {
				let cell: CellUI = this.getChildByCellIndex(group.toIndex);
				if (cell)
					promises.push(cell.moveTo(group.delta * 100, this.getCellPoint(group.toIndex)));
			}
		}

		return Promise.all(promises);
	}

	public getChildByCellIndex(index: number) : CellUI|null {
		for (let i = 0; i < this.numChildren; i++) {
			let element: CellUI = this.getChildAt(i) as CellUI;
			if (element.cell.index == index)
				return element;
		}
		return null;
	}

	public clearSelected() : void {
		for (let i = 0; i < this.numChildren; i++) {
			let element: CellUI = this.getChildAt(i) as CellUI;
			element.selected = false;
		}
	}

	public select(cell: Cell) : void {
		this.clearSelected();
		if (!cell) return;
		let element: CellUI = this.getChildByCellIndex(cell.index);
		if (element instanceof CellUI)
			element.selected = true;
	}


}