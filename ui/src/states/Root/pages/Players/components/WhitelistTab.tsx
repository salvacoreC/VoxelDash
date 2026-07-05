import { useState } from "react";
import { t } from "i18next";
import { WhitelistData } from "@/types/player";
import { postRequest } from "@/lib/RequestUtil";
import { toast } from "@/hooks/use-toast";
import { usePlayerSelection } from "@/hooks/use-player-selection";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableToolbar,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  ListIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";

interface WhitelistTabProps {
  data: WhitelistData;
  onRefresh: () => Promise<void>;
}

const WhitelistTab = ({ data, onRefresh }: WhitelistTabProps) => {
  const {
    selectedPlayers,
    setTargetPlayer,
    togglePlayer,
    toggleAll,
    clearSelection,
    getPlayersToAction,
    isAllSelected,
    hasSelection,
  } = usePlayerSelection({ players: data.players });

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");

  const handleWhitelistStatusChange = async (enabled: boolean) => {
    await postRequest("players/whitelist/status", { enabled });
    toast({ description: enabled ? t("players.whitelist_enabled") : t("players.whitelist_disabled") });
    await onRefresh();
  };

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return;

    await postRequest("players/whitelist/add", { playerName: newPlayerName.trim() });
    toast({ description: t("players.whitelist_added") });
    setAddDialogOpen(false);
    setNewPlayerName("");
    await onRefresh();
  };

  const handleRemovePlayers = async (playerNames: string[]) => {
    for (const name of playerNames) {
      await postRequest("players/whitelist/remove", { playerName: name });
    }
    toast({ description: t("players.whitelist_removed", { count: playerNames.length }) });
    setRemoveDialogOpen(false);
    clearSelection();
    await onRefresh();
  };

  const openRemoveDialog = (playerName?: string) => {
    setTargetPlayer(playerName || null);
    setRemoveDialogOpen(true);
  };

  return (
    <div className="space-y-4">

      {data.players.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <ListIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">{t("players.no_whitelisted")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("players.no_whitelisted_description")}</p>
        </div>
      ) : (
        <div className="rounded-xl bg-card overflow-x-auto">
          <TableToolbar>

            <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
              <ListIcon className="h-5 w-5 text-muted-foreground" />
              <Label className="font-medium">{t("players.whitelist_status")}</Label>
              <Switch
                checked={data.enabled}
                onCheckedChange={handleWhitelistStatusChange}
              />
            </div>

            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-lg">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  {t("players.add_to_whitelist")}
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-xl">
                <DialogHeader>
                  <DialogTitle>{t("players.add_to_whitelist")}</DialogTitle>
                  <DialogDescription>
                    {t("players.add_whitelist_description")}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="playerName">{t("players.player_name")}</Label>
                  <Input
                    id="playerName"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder={t("players.enter_player_name")}
                    className="mt-2"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    {t("action.cancel")}
                  </Button>
                  <Button onClick={handleAddPlayer} disabled={!newPlayerName.trim()}>
                    {t("action.add")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {hasSelection && (
              <Button variant="destructive" onClick={() => openRemoveDialog()} className="rounded-lg">
                <TrashIcon className="h-4 w-4 mr-2" />
                {t("players.remove_selected", { count: selectedPlayers.length })}
              </Button>
            )}
          </TableToolbar>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>{t("players.table.player")}</TableHead>
                <TableHead>{t("players.table.uuid")}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.players.map((player) => (
                <TableRow key={player.uuid}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPlayers.includes(player.name)}
                      onCheckedChange={() => togglePlayer(player.name)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://mc-heads.net/avatar/${player.uuid}/32`}
                        alt={player.name}
                        className="h-8 w-8 rounded"
                      />
                      <span className="font-medium">{player.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[160px]">
                    <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded block truncate">
                      {player.uuid}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRemoveDialog(player.name)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div >
      )}

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("players.remove_from_whitelist")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("players.remove_whitelist_description", { count: getPlayersToAction().length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("action.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRemovePlayers(getPlayersToAction())}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("action.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
};

export default WhitelistTab;
