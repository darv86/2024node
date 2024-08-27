({
	async sendMsg({ msg, addressee }) {
		console.log({ method: 'messenger.sendMsg', msg, addressee });
		return { status: 'ok' };
	},
	async deleteMsg({ msg }) {
		console.log({ method: 'messenger.deleteMsg', msg });
		return { status: 'ok' };
	},
	async method({ arg }) {
		console.log({ method: 'messenger.method', arg });
		return { status: 'ok' };
	},
});
