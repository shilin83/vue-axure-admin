<script setup lang="ts">
import { useMouse } from "@vueuse/core";

defineOptions({
	name: "EyeBall",
});

const {
	size = 48,
	pupilSize = 16,
	maxDistance = 10,
	eyeColor = "white",
	pupilColor = "black",
	isBlinking = false,
	forceLookX,
	forceLookY,
} = defineProps<{
	size?: number;
	pupilSize?: number;
	maxDistance?: number;
	eyeColor?: string;
	pupilColor?: string;
	isBlinking?: boolean;
	forceLookX?: number;
	forceLookY?: number;
}>();

const { x, y } = useMouse({ touch: false });

const eyeRef = useTemplateRef<HTMLDivElement>("eyeRef");

const pupilPosition = computed(() => {
	if (!eyeRef.value) {
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

	const eye = eyeRef.value.getBoundingClientRect();
	const eyeCenterX = eye.left + eye.width / 2;
	const eyeCenterY = eye.top + eye.height / 2;
	const deltaX = x.value - eyeCenterX;
	const deltaY = y.value - eyeCenterY;
	const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance!);
	const angle = Math.atan2(deltaY, deltaX);
	const mouseX = Math.cos(angle) * distance;
	const mouseY = Math.sin(angle) * distance;

	return {
		mouseX: mouseX,
		mouseY: mouseY,
	};
});
</script>

<template>
	<div
		ref="eyeRef"
		class="flex-center overflow-hidden rounded-full transition-all duration-150"
		:style="{
			width: `${size}px`,
			height: isBlinking ? '2px' : `${size}px`,
			backgroundColor: eyeColor,
		}"
	>
		<div
			class="rounded-full"
			:style="{
				width: `${pupilSize}px`,
				height: `${pupilSize}px`,
				backgroundColor: pupilColor,
				transform: `translate(${pupilPosition.mouseX}px, ${pupilPosition.mouseY}px)`,
				transition: 'transform 0.1s ease-out',
			}"
		/>
	</div>
</template>
