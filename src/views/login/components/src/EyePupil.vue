<script setup lang="ts">
import { useMouse } from "@vueuse/core";

defineOptions({
	name: "EyePupil",
});

const {
	size = 12,
	maxDistance = 5,
	pupilColor = "black",
	forceLookX,
	forceLookY,
} = defineProps<{
	size?: number;
	maxDistance?: number;
	pupilColor?: string;
	forceLookX?: number;
	forceLookY?: number;
}>();

const { x, y } = useMouse();

const pupilRef = useTemplateRef<HTMLDivElement>("pupilRef");

const pupilPosition = computed(() => {
	if (!pupilRef.value) {
		return {
			mouseX: 0,
			mouseY: 0,
		};
	}

	if (forceLookX !== undefined && forceLookY !== undefined) {
		return {
			mouseX: forceLookX,
			mouseY: forceLookY,
		};
	}

	const pupil = pupilRef.value.getBoundingClientRect();
	const pupilCenterX = pupil.left + pupil.width / 2;
	const pupilCenterY = pupil.top + pupil.height / 2;
	const deltaX = x.value - pupilCenterX;
	const deltaY = y.value - pupilCenterY;
	const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
	const angle = Math.atan2(deltaY, deltaX);
	const mouseX = Math.cos(angle) * distance;
	const mouseY = Math.sin(angle) * distance;

	return {
		mouseX,
		mouseY,
	};
});
</script>

<template>
	<div
		ref="pupilRef"
		class="rounded-full"
		:style="{
			width: `${size}px`,
			height: `${size}px`,
			backgroundColor: pupilColor,
			transform: `translate(${pupilPosition?.mouseX}px, ${pupilPosition?.mouseY}px)`,
			transition: 'transform 0.1s ease-out',
		}"
	/>
</template>
