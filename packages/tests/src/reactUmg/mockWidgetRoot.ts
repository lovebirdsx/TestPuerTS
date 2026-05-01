import type { IWidgetRoot, UEWidget as UEWidgetType } from 'editor';
import { UEWidget, createRendererForTest, compareWidgetProps } from 'editor';

export class MockWidgetRoot implements IWidgetRoot {
	public readonly children: UEWidgetType[] = [];

	public appendChild(child: UEWidgetType): void {
		child.setNativeSlot(null as any);
		this.children.push(child);
	}

	public removeChild(child: UEWidgetType): void {
		child.unbindAll();
		this.children.splice(this.children.indexOf(child), 1);
	}
}

export { UEWidget, createRendererForTest, compareWidgetProps };
