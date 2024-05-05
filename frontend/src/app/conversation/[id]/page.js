import Chat from "@/components/chat"

export default function Conversation({params}) {
    console.log(params.id);
    return (
        <div className="flex flex-col items-center justify-center h-full w-full">
            <Chat title={params.id} />
        </div>
    );
}