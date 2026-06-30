<script setup lang="ts">
export type CaptchaRef = {
	refresh: () => void;
};

defineOptions({
	name: "VerifyCode",
});

const props = withDefaults(
	defineProps<{
		width?: number;
		height?: number;
		length?: number;
	}>(),
	{
		width: 120,
		height: 40,
		length: 4,
	},
);

const emit = defineEmits<{
	handleChange: [code: string];
}>();

const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasRef");

const randomColor = (min: number, max: number): string => {
	const r = Math.floor(Math.random() * (max - min) + min);
	const g = Math.floor(Math.random() * (max - min) + min);
	const b = Math.floor(Math.random() * (max - min) + min);

	return `rgb(${r},${g},${b})`;
};

const randomCode = (): string => {
	const chars = "ABCDEFHJKMNPRSTWXYZabcdefhjkmnprstwxyz2345678";

	let code = "";
	for (let i = 0; i < props.length; i++) {
		code += chars[Math.floor(Math.random() * chars.length)];
	}

	return code;
};

const drawCaptcha = (): void => {
	const canvas = canvasRef.value;
	if (!canvas) {
		return;
	}

	const ctx = canvas.getContext("2d");

	if (!ctx) {
		return;
	}

	ctx.clearRect(0, 0, props.width, props.height);
	ctx.fillStyle = randomColor(180, 240);
	ctx.fillRect(0, 0, props.width, props.height);

	const code = randomCode();
	emit("handleChange", code);

	for (let i = 0; i < props.length; i++) {
		const fontSize = Math.floor(Math.random() * (props.height * 0.5)) + props.height * 0.5;
		const deg = (Math.random() * 30 * Math.PI) / 180;

		ctx.font = `${fontSize}px Arial`;
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		ctx.fillStyle = randomColor(50, 160);
		ctx.save();

		const x = (props.width / 4) * i + props.width / 8;
		const y = props.height / 2;

		ctx.translate(x, y);
		ctx.rotate(Math.random() > 0.5 ? deg : -deg);
		ctx.fillText(code[i]!, 0, 0);
		ctx.restore();
	}

	for (let i = 0; i < props.length * 2; i++) {
		ctx.beginPath();
		ctx.moveTo(Math.random() * props.width, Math.random() * props.height);
		ctx.lineTo(Math.random() * props.width, Math.random() * props.height);
		ctx.strokeStyle = randomColor(40, 180);
		ctx.stroke();
	}

	for (let i = 0; i < props.length * 5; i++) {
		ctx.beginPath();
		ctx.arc(Math.random() * props.width, Math.random() * props.height, 1, 0, 2 * Math.PI);
		ctx.fillStyle = randomColor(0, 255);
		ctx.fill();
	}
};

defineExpose<CaptchaRef>({
	refresh: drawCaptcha,
});

onMounted(() => {
	drawCaptcha();
});
</script>

<template>
	<canvas ref="canvasRef" :width="width" :height="height" @click="drawCaptcha" class="cursor-pointer" />
</template>
