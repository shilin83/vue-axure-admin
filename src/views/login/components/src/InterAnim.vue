<script setup lang="ts">
import { useMouse, useTimeoutFn } from "@vueuse/core";

import { EyeBall, EyePupil } from "..";

defineOptions({
	name: "InterAnim",
});

const props = defineProps<{
	isTyping: boolean;
	showPassword: boolean;
	passwordLength: number;
}>();

const { x, y } = useMouse();

const calculatePosition = (
	ref: Ref<Nullable<HTMLDivElement>>,
): {
	faceX: number;
	faceY: number;
	bodySkew: number;
} => {
	if (!ref.value) {
		return {
			faceX: 0,
			faceY: 0,
			bodySkew: 0,
		};
	}

	const rect = ref.value.getBoundingClientRect();
	const centerX = rect.left + rect.width / 2;
	const centerY = rect.top + rect.height / 3;
	const deltaX = x.value - centerX;
	const deltaY = y.value - centerY;
	const faceX = Math.max(-15, Math.min(15, deltaX / 20));
	const faceY = Math.max(-10, Math.min(10, deltaY / 30));
	const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));

	return {
		faceX,
		faceY,
		bodySkew,
	};
};

const isHidingPassword = computed(() => props.passwordLength > 0 && !props.showPassword);

const isLookingAtEachOther = ref<boolean>(false);
const isPurplePeeking = ref<boolean>(false);
const isPurpleBlinking = ref<boolean>(false);
const isBlackBlinking = ref<boolean>(false);

const purpleRef = useTemplateRef<HTMLDivElement>("purpleRef");
const blackRef = useTemplateRef<HTMLDivElement>("blackRef");
const yellowRef = useTemplateRef<HTMLDivElement>("yellowRef");
const orangeRef = useTemplateRef<HTMLDivElement>("orangeRef");

const purplePos = calculatePosition(purpleRef);
const blackPos = calculatePosition(blackRef);
const yellowPos = calculatePosition(yellowRef);
const orangePos = calculatePosition(orangeRef);

watch(
	() => props.isTyping,
	(val) => {
		if (val) {
			isLookingAtEachOther.value = true;
			useTimeoutFn(() => {
				isLookingAtEachOther.value = false;
			}, 800);
		} else {
			isLookingAtEachOther.value = false;
		}
	},
);

watch(
	() => [props.passwordLength, props.showPassword, isPurplePeeking],
	([passwordLength, showPassword, _]) => {
		if (passwordLength && showPassword) {
			useTimeoutFn(
				() => {
					isPurplePeeking.value = true;
					useTimeoutFn(() => {
						isPurplePeeking.value = false;
					}, 800);
				},
				Math.random() * 3000 + 2000,
			);
		} else {
			isPurplePeeking.value = false;
		}
	},
);

onMounted(() => {
	const getRandomBlinkInterval = (): number => {
		return Math.random() * 4000 + 3000;
	};

	const schedulePurpleBlink = (): void => {
		useTimeoutFn(() => {
			isPurpleBlinking.value = true;
			useTimeoutFn(() => {
				isPurpleBlinking.value = false;
				schedulePurpleBlink();
			}, 150);
		}, getRandomBlinkInterval());
	};

	const scheduleBlackBlink = (): void => {
		useTimeoutFn(() => {
			isBlackBlinking.value = true;
			useTimeoutFn(() => {
				isBlackBlinking.value = false;
				scheduleBlackBlink();
			}, 150);
		}, getRandomBlinkInterval());
	};

	scheduleBlackBlink();
	schedulePurpleBlink();
});
</script>

<template>
	<div class="relative h-100 w-140">
		<div
			ref="purpleRef"
			class="rounded-t-2 transform-origin-bc absolute bottom-0 left-20 z-1 w-45 bg-[#6C3FF5] transition-all duration-700 ease-in-out"
			:style="{
				height: props.isTyping || isHidingPassword ? '440px' : '400px',
				transform:
					passwordLength > 0 && showPassword
						? `skewX(0deg)`
						: isTyping || isHidingPassword
							? `skewX(${purplePos.bodySkew - 12}deg) translateX(40px)`
							: `skewX(${purplePos.bodySkew}deg)`,
			}"
		>
			<div
				class="absolute flex gap-10 transition-all duration-700 ease-in-out"
				:style="{
					left:
						passwordLength > 0 && showPassword ? '20px' : isLookingAtEachOther ? '55px' : `${45 + purplePos.faceX}px`,
					top:
						passwordLength > 0 && showPassword ? '35px' : isLookingAtEachOther ? '65px' : `${40 + purplePos.faceY}px`,
				}"
			>
				<eye-ball
					:size="18"
					:pupilSize="7"
					:maxDistance="5"
					eyeColor="white"
					pupilColor="#2D2D2D"
					:isBlinking="isPurpleBlinking"
					:forceLookX="
						passwordLength > 0 && showPassword ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined
					"
					:forceLookY="
						passwordLength > 0 && showPassword ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined
					"
				/>
				<eye-ball
					:size="18"
					:pupilSize="7"
					:maxDistance="5"
					eyeColor="white"
					pupilColor="#2D2D2D"
					:isBlinking="isPurpleBlinking"
					:forceLookX="
						passwordLength > 0 && showPassword ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined
					"
					:forceLookY="
						passwordLength > 0 && showPassword ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined
					"
				/>
			</div>
		</div>
		<div
			ref="blackRef"
			class="rounded-t-3 transform-origin-bc absolute bottom-0 left-60 z-2 h-80 w-30 bg-[#2D2D2D] transition-all duration-700 ease-in-out"
			:style="{
				transform:
					passwordLength > 0 && showPassword
						? `skewX(0deg)`
						: isLookingAtEachOther
							? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
							: isTyping || isHidingPassword
								? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
								: `skewX(${blackPos.bodySkew || 0}deg)`,
			}"
		>
			<div
				class="absolute flex gap-6 transition-all duration-700 ease-in-out"
				:style="{
					left:
						passwordLength > 0 && showPassword ? '10px' : isLookingAtEachOther ? '32px' : `${26 + blackPos.faceX}px`,
					top: passwordLength > 0 && showPassword ? '28px' : isLookingAtEachOther ? '12px' : `${32 + blackPos.faceY}px`,
				}"
			>
				<eye-ball
					eyeColor="white"
					pupilColor="#2D2D2D"
					:size="16"
					:pupilSize="6"
					:maxDistance="4"
					:isBlinking="isBlackBlinking"
					:forceLookX="passwordLength > 0 && showPassword ? -4 : isLookingAtEachOther ? 0 : undefined"
					:forceLookY="passwordLength > 0 && showPassword ? -4 : isLookingAtEachOther ? -4 : undefined"
				/>
				<eye-ball
					eyeColor="white"
					pupilColor="#2D2D2D"
					:size="16"
					:pupilSize="6"
					:maxDistance="4"
					:isBlinking="isBlackBlinking"
					:forceLookX="passwordLength > 0 && showPassword ? -4 : isLookingAtEachOther ? 0 : undefined"
					:forceLookY="passwordLength > 0 && showPassword ? -4 : isLookingAtEachOther ? -4 : undefined"
				/>
			</div>
		</div>
		<div
			ref="orangeRef"
			class="rounded-t-30 transform-origin-bc absolute bottom-0 left-0 z-3 h-50 w-60 bg-[#FF9B6B] transition-all duration-700 ease-in-out"
			:style="{
				transform: passwordLength > 0 && showPassword ? `skewX(0deg)` : `skewX(${orangePos.bodySkew || 0}deg)`,
			}"
		>
			<div
				class="absolute flex gap-8 transition-all duration-200 ease-out"
				:style="{
					left: passwordLength > 0 && showPassword ? '50px' : `${82 + (orangePos.faceX || 0)}px`,
					top: passwordLength > 0 && showPassword ? '85px' : `${90 + (orangePos.faceY || 0)}px`,
				}"
			>
				<eye-pupil
					pupilColor="#2D2D2D"
					:size="12"
					:maxDistance="5"
					:forceLookX="passwordLength > 0 && showPassword ? -5 : undefined"
					:forceLookY="passwordLength > 0 && showPassword ? -4 : undefined"
				/>
				<eye-pupil
					pupilColor="#2D2D2D"
					:size="12"
					:maxDistance="5"
					:forceLookX="passwordLength > 0 && showPassword ? -5 : undefined"
					:forceLookY="passwordLength > 0 && showPassword ? -4 : undefined"
				/>
			</div>
		</div>
		<div
			ref="yellowRef"
			class="rounded-t-20 transform-origin-bc absolute bottom-0 left-80 z-4 h-60 w-35 bg-[#E8D754] transition-all duration-700 ease-in-out"
			:style="{
				transform: passwordLength > 0 && showPassword ? `skewX(0deg)` : `skewX(${yellowPos.bodySkew || 0}deg)`,
			}"
		>
			<div
				class="absolute flex gap-6 transition-all duration-200 ease-out"
				:style="{
					left: passwordLength > 0 && showPassword ? '20px' : `${52 + (yellowPos.faceX || 0)}px`,
					top: passwordLength > 0 && showPassword ? '35px' : `${40 + (yellowPos.faceY || 0)}px`,
				}"
			>
				<eye-pupil
					pupilColor="#2D2D2D"
					:size="12"
					:maxDistance="5"
					:forceLookX="passwordLength > 0 && showPassword ? -5 : undefined"
					:forceLookY="passwordLength > 0 && showPassword ? -4 : undefined"
				/>
				<eye-pupil
					pupilColor="#2D2D2D"
					:size="12"
					:maxDistance="5"
					:forceLookX="passwordLength > 0 && showPassword ? -5 : undefined"
					:forceLookY="passwordLength > 0 && showPassword ? -4 : undefined"
				/>
			</div>
			<div
				class="absolute h-1 w-20 rounded-full bg-[#2D2D2D] transition-all duration-200 ease-out"
				:style="{
					left: passwordLength > 0 && showPassword ? '10px' : `${40 + (yellowPos.faceX || 0)}px`,
					top: passwordLength > 0 && showPassword ? '88px' : `${88 + (yellowPos.faceY || 0)}px`,
				}"
			/>
		</div>
	</div>
</template>
