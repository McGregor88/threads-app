interface Props {
    name: string;
}

function DefaultTab({ name }: Props) {
    return (
        <section className="mt-9 flex flex-col gap-10">
            <p className="mt-6 text-center text-base-regular text-gray-1">
                {name} In pocess...
            </p>
        </section>
    );
}

export default DefaultTab;
