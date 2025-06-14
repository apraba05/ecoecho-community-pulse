
import React, { useState } from 'react';
import { Leaf, Users, Calendar, Plus, Share2, Trophy, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEcoActions } from '@/hooks/useEcoActions';

interface Friend {
  id: string;
  name: string;
  points: number;
  avatar: string;
}

const Index = () => {
  const { user } = useAuth();
  const { ecoActions, addEcoAction } = useEcoActions();
  
  // Mock friends data (can be moved to Supabase later)
  const [friends] = useState([
    { id: '1', name: 'Alex Green', points: 127, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
    { id: '2', name: 'Sarah Earth', points: 95, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face' },
    { id: '3', name: 'Mike Forest', points: 88, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' },
  ]);

  const [newActionTitle, setNewActionTitle] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showAddAction, setShowAddAction] = useState(false);
  const [showInviteFriend, setShowInviteFriend] = useState(false);

  const totalPoints = ecoActions.reduce((sum, action) => sum + action.impact_score, 0);
  const communityImpact = totalPoints + friends.reduce((sum, friend) => sum + friend.points, 0);

  const handleAddAction = async () => {
    if (!newActionTitle.trim()) return;
    
    await addEcoAction(newActionTitle);
    setNewActionTitle('');
    setShowAddAction(false);
  };

  const inviteFriend = () => {
    if (!inviteEmail.trim()) return;
    
    setInviteEmail('');
    setShowInviteFriend(false);
    toast({
      title: "Invitation sent!",
      description: `Invite sent to ${inviteEmail}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-50 via-white to-eco-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-eco-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-eco-gradient rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">EcoEcho</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-eco-100 text-eco-800 hover:bg-eco-200">
                <Trophy className="w-4 h-4 mr-1" />
                {totalPoints} points
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="animate-fade-in border-eco-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Target className="w-5 h-5 text-eco-600" />
                <span>Your Impact</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-eco-600 mb-1">{totalPoints}</div>
              <p className="text-sm text-gray-600">Eco points earned</p>
              <div className="mt-3 bg-eco-100 rounded-full h-2">
                <div 
                  className="bg-eco-gradient h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalPoints / 50) * 100, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in border-eco-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="w-5 h-5 text-eco-600" />
                <span>Friends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-eco-600 mb-1">{friends.length}</div>
              <p className="text-sm text-gray-600">Eco warriors</p>
              <div className="flex -space-x-2 mt-3">
                {friends.slice(0, 3).map((friend) => (
                  <img
                    key={friend.id}
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                ))}
                {friends.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-eco-200 border-2 border-white flex items-center justify-center text-xs font-semibold text-eco-800">
                    +{friends.length - 3}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in border-eco-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Leaf className="w-5 h-5 text-eco-600" />
                <span>Community</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-eco-600 mb-1">{communityImpact}</div>
              <p className="text-sm text-gray-600">Total community impact</p>
              <div className="mt-3 text-xs text-eco-700 bg-eco-50 px-2 py-1 rounded-full inline-block">
                🌱 Growing strong together!
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Eco Actions */}
          <Card className="animate-scale-in border-eco-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-eco-600" />
                    <span>Recent Actions</span>
                  </CardTitle>
                  <CardDescription>Track your daily eco-friendly activities</CardDescription>
                </div>
                <Dialog open={showAddAction} onOpenChange={setShowAddAction}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-eco-gradient hover:bg-eco-700 text-white">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Action
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Log Eco Action</DialogTitle>
                      <DialogDescription>
                        What sustainable action did you take today?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="e.g., Used public transport"
                        value={newActionTitle}
                        onChange={(e) => setNewActionTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddAction()}
                      />
                      <div className="flex space-x-2">
                        <Button onClick={handleAddAction} className="flex-1 bg-eco-gradient hover:bg-eco-700">
                          Log Action
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddAction(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ecoActions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Leaf className="w-12 h-12 mx-auto mb-3 text-eco-300" />
                    <p>No actions logged yet. Start your journey!</p>
                  </div>
                ) : (
                  ecoActions.map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-3 bg-eco-50 rounded-lg hover:bg-eco-100 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{action.action_description}</p>
                        <p className="text-sm text-gray-600">{action.action_date}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">
                          eco
                        </Badge>
                        <span className="font-semibold text-eco-600">+{action.impact_score}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Friends & Community */}
          <Card className="animate-scale-in border-eco-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-eco-600" />
                    <span>Eco Friends</span>
                  </CardTitle>
                  <CardDescription>Build your sustainability network</CardDescription>
                </div>
                <Dialog open={showInviteFriend} onOpenChange={setShowInviteFriend}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="border-eco-300 text-eco-700 hover:bg-eco-50">
                      <Share2 className="w-4 h-4 mr-1" />
                      Invite
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Invite a Friend</DialogTitle>
                      <DialogDescription>
                        Share EcoEcho with someone who cares about the environment!
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        type="email"
                        placeholder="friend@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && inviteFriend()}
                      />
                      <div className="flex space-x-2">
                        <Button onClick={inviteFriend} className="flex-1 bg-eco-gradient hover:bg-eco-700">
                          Send Invite
                        </Button>
                        <Button variant="outline" onClick={() => setShowInviteFriend(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {friends.map((friend, index) => (
                  <div key={friend.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-eco-200 hover:border-eco-300 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-10 h-10 rounded-full"
                        />
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-xs">👑</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{friend.name}</p>
                        <p className="text-sm text-gray-600">Eco warrior</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-eco-600">{friend.points}</p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 p-4 bg-gradient-to-r from-eco-100 to-eco-200 rounded-lg">
                  <h4 className="font-semibold text-eco-800 mb-2">Community Challenge</h4>
                  <p className="text-sm text-eco-700 mb-3">
                    Plant 1,000 virtual trees together! 🌳
                  </p>
                  <div className="bg-white rounded-full h-3 mb-2">
                    <div 
                      className="bg-eco-gradient h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((communityImpact / 1000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-eco-600 font-medium">
                    {communityImpact}/1000 trees planted
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-eco-200">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Together We Can Make a Difference
              </h3>
              <p className="text-gray-600 mb-6">
                Every small action counts towards a more sustainable future. 
                Track your progress, inspire friends, and be part of a community that cares.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-eco-gradient hover:bg-eco-700 text-white"
                  onClick={() => setShowAddAction(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Log Your First Action
                </Button>
                <Button 
                  variant="outline" 
                  className="border-eco-300 text-eco-700 hover:bg-eco-50"
                  onClick={() => setShowInviteFriend(true)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Invite Friends
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
