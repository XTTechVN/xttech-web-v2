// Ngăn xếp lớp nổi (drawer, menu thả xuống): Esc chỉ đóng lớp trên cùng
const stack: symbol[] = [];

export function pushLayer(): symbol {
  const id = Symbol('layer');
  stack.push(id);
  return id;
}

export function popLayer(id: symbol) {
  const i = stack.indexOf(id);
  if (i >= 0) stack.splice(i, 1);
}

export const isTopLayer = (id: symbol) => stack[stack.length - 1] === id;

// Khóa cuộn nền đếm theo số lớp đang mở: chỉ trả lại khi lớp cuối cùng đóng
let locks = 0;
let saved = { overflow: '', paddingRight: '' };

export function lockScroll() {
  if (locks++ > 0) return;
  const { style } = document.body;
  saved = { overflow: style.overflow, paddingRight: style.paddingRight };
  const gap = window.innerWidth - document.documentElement.clientWidth;
  style.overflow = 'hidden';
  if (gap > 0) style.paddingRight = `${gap}px`;
}

export function unlockScroll() {
  if (--locks > 0) return;
  locks = 0;
  document.body.style.overflow = saved.overflow;
  document.body.style.paddingRight = saved.paddingRight;
}
